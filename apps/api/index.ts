import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {getMe, logout} from './src/routes/auth'
import googleOAuthHandler from './src/routes/googleOAuth'
import auth from './src/middlewares/auth'
import {graphql} from 'graphql'

import schema from './src/graphql/schema'
import rootValue from './src/graphql/rootValue'

const app = new Hono()

const node_env = process.env.NODE_ENV
console.log(`Running in ${node_env} mode`)

const origin = node_env === 'development' ? ['http://localhost:3000'] : ['https://manganaya.com/', 'https://www.manganaya.com/']

const corsOptions = {
  origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

app.use(cors(corsOptions))

app.use('/graphql', auth) // uncomment this line to enable authentication
app.get('/oauth/google', googleOAuthHandler)
app.get('/logout', logout)
app.get('/me', getMe)

app.post('/graphql', async(c) => {
  const {query, variables, operationName} = await c.req.json()

  const result = await graphql({
    schema,
    source: query,
    rootValue,
    variableValues: variables,
    operationName,
    contextValue: c
  })

  return c.json(result)
})

app.get('/', (c) => (
  c.json({
    message: 'Hello World'
  })
))

export default {
  port: 8080,
  fetch: app.fetch
}