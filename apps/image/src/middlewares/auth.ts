import type {Context, Next} from 'hono'
import {html} from 'hono/html'
import {getCookie, getSignedCookie} from 'hono/cookie'
import jwt from 'jsonwebtoken'
import {getCachedSSMClient} from '@manga-naya/cache'

const getJWTSecret = async (): Promise<string | undefined> => {
  const node_env = process.env.NODE_ENV

  return node_env === 'development' ? process.env.JWT_SECRET : (async() => {
    const secrets = await getCachedSSMClient()
    const JWT_SECRET = await secrets.getSecureParameter('JWT_SECRET')
    return typeof JWT_SECRET === 'string' ? JWT_SECRET : undefined
  })()
}

const reject = (c: Context) => {
  c.status(401)
  return c.html(html`
    <body style="background-color: #1a1a1a; color: #fff; font-family: sans-serif;margin: 0;padding: 0;">
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; font-size: 1.5rem;flex-direction: column;">
        <h1>Unauthorized</h1>
        <img src="https://http.cat/401" alt="401 Unauthorized" />
      </div>
    </body>
  `)
}

const JWT_SECRET = await getJWTSecret()

const auth = async (c: Context, next: Next) => {
  // const token = c.req.header('Authorization')
  // get the cookie called Authorization from the request
  const token = await getCookie(c, 'Authorization')
  console.log(token)
  
  if (!token) {
    c.status(401)
    return reject(c)
  }

  if (!JWT_SECRET) {
    c.status(500)
    console.error('Failed to get JWT_SECRET from secrets manager :((((((')
    return c.json({
      message: 'Something went wrong :('
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    await next()
  } catch (e) {
    c.status(401)
    return reject(c)
  }
}

export default auth