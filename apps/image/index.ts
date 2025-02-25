import {Hono} from 'hono'
import {cors} from 'hono/cors'
import auth from './src/middlewares/auth'

import getPanel from './src/controllers/panel'
import getThumbnail from './src/controllers/thumbnail'

const app = new Hono()

const origin = process.env.NODE_ENV === 'development' ? '*' : 'https://manganaya.com'

// for development
const corsOptions = {
  origin: origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

app.use(cors(corsOptions))
// app.use('/panel', auth) // uncomment this line to enable authentication
// app.use('/thumbnail', auth) // uncomment this line to enable authentication

app.get('/panel/:id', async(c) => {
  try {
    const panel = await getPanel(c)
    
    // @ts-ignore
    return c.newResponse(panel)
  } catch (e) {
    c.status(500)
    return c.json({message: 'Something went wrong :('})
  }
})

app.get('/thumbnail/:id', async(c) => {
  try {
    const thumbnail = await getThumbnail(c)

    // @ts-ignore
    return c.newResponse(thumbnail)
  } catch (e) {
    c.status(500)
    console.log('Error while getting thumbnail:', e)
    return c.json({message: 'Something went wrong :('})
  }
})

export default {
  port: 8000,
  fetch: app.fetch
}
