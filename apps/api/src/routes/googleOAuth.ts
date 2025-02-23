import axios from 'axios'
import qs from 'qs'
import {setCookie} from 'hono/cookie'
import {getCachedSSMClient} from '@manga-naya/cache'
import type {Context} from 'hono'

import {isUserExist, getUser} from '../db/user'
import {addUser, generateToken} from '../controllers/auth'

type Config = {
  googleClientId: string,
  googleClientSecret: string,
  googleRedirectUrl: string
}

const getConfig = async (): Promise<Config> => {
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    const envGoogleClientId = process.env.google_client_id
    const envGoogleClientSecret = process.env.google_client_secret
    const envGoogleRedirectUrl = process.env.google_redirect_url

    if (!envGoogleClientId || !envGoogleClientSecret || !envGoogleRedirectUrl) {
      throw new Error('Missing required environment variables')
    }

    return {
      googleClientId: envGoogleClientId,
      googleClientSecret: envGoogleClientSecret,
      googleRedirectUrl: envGoogleRedirectUrl
    }
  }

  const ssm = await getCachedSSMClient()
  const googleClientSecret = await ssm.getSecureParameter('GOOGLE_CLIENT_SECRET')
  const googleClientId = await ssm.getParameter('GOOGLE_CLIENT_ID')
  const googleRedirectUrl = await ssm.getParameter('GOOGLE_REDIRECT_URL')

  if (!googleClientId || !googleRedirectUrl || (typeof googleClientSecret !== 'string')) {
    throw new Error('Missing required environment variables')
  }

  return {
    googleClientId,
    googleClientSecret,
    googleRedirectUrl
  }
}

const redirectUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://manganaya.com'

interface GoogleTokensResult {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  id_token: string
}

const getGoogleOAuthTokens = async ({code, config}: {code: string, config: Config}): Promise<GoogleTokensResult | null> => {
  const url = 'https://oauth2.googleapis.com/token'

  const params = {
    code,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: config.googleRedirectUrl,
    grant_type: 'authorization_code'
  }

  try {
    const response = await axios.post<GoogleTokensResult>(url, qs.stringify(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data
  } catch (e) {
    console.error(e, 'Failed to get Google OAuth tokens')
    return null
  }
}

interface GoogleUserResult {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

const getGoogleUser = async ({id_token, access_token}: {id_token: string, access_token: string}): Promise<GoogleUserResult> => {
  try {
    const result = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })

    return result.data
  } catch (e) {
    console.error(e, 'Failed to get Google user')
    throw e
  }
}

const config = await getConfig()

const googleOAuthHandler = async (c: Context) => {
  try {
    const code = c.req.query('code')

    if (!code) {
      c.status(400)
      return c.json({
        message: 'Missing required query parameter: code'
      })
    }

    const tokens = await getGoogleOAuthTokens({code, config})

    if (!tokens) {
      c.status(401)
      console.log(`Failed to get Google OAuth tokens, code: ${code}, config: ${JSON.stringify(config)}`)
      return c.json({
        message: 'Failed to get Google OAuth tokens'
      })
    }

    const {id_token, access_token} = tokens

    const googleUser = await getGoogleUser({id_token, access_token})

    if (!googleUser.verified_email) {
      c.status(401)
      return c.json({
        message: 'Google account is not verified'
      })
    }

    const exist = await isUserExist(googleUser.email)
    
    if (!exist) {
      await addUser(googleUser.email, googleUser.name, googleUser.picture || '')
    }

    const user = await getUser(googleUser.email)
    const token = await generateToken(user)
    
    setCookie(c, 'Authorization', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'manganaya.com',
      maxAge: 1209600 // 2 weeks
    })

    return c.redirect(redirectUrl)
  } catch (e) {
    return c.redirect(`${redirectUrl}/error`)
  }
}

export default googleOAuthHandler