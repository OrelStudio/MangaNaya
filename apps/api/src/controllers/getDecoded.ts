import {getCachedSSMClient} from '@manga-naya/cache'
import type {Context} from 'hono'
import {getCookie} from 'hono/cookie'
import jwt from 'jsonwebtoken'

const getJWTSecret = async (): Promise<string | undefined> => {
  const node_env = process.env.NODE_ENV

  return node_env === 'development' ? process.env.JWT_SECRET : (async() => {
    const secrets = await getCachedSSMClient()
    const JWT_SECRET = await secrets.getSecureParameter('JWT_SECRET')
    return typeof JWT_SECRET === 'string' ? JWT_SECRET : undefined
  })()
}

const JWT_SECRET = await getJWTSecret()

const getDecoded = async (c: Context) => {
  const token = await getCookie(c, 'Authorization')
  
  if (!token) {
    c.status(401)
    throw new Error('Unauthorized')
  }

  if (!JWT_SECRET) {
    c.status(500)
    console.error('Failed to get JWT_SECRET from secrets manager :((((((')
    return c.json({
      message: 'Something went wrong :('
    })
  }

  const decoded = jwt.verify(token, JWT_SECRET)

  return decoded
}

export default getDecoded