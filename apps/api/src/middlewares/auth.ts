import type {Context, Next} from 'hono'
import {html} from 'hono/html'
import getDecoded from '../controllers/getDecoded'

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

const auth = async (c: Context, next: Next) => {
  try {
    const decoded = getDecoded(c)
    c.set('user', decoded)
    await next()
  } catch (e) {
    c.status(401)
    return reject(c)
  }
}

export default auth