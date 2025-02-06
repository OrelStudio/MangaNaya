import type {Context} from 'hono'
import {setCookie} from 'hono/cookie'
import {addUser} from '../controllers/auth'
import {getUser} from '../db'
import getDecoded from '../controllers/getDecoded'

const redirectUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://manganaya.com'

const getMe = async (c: Context) => {
  return getDecoded(c).then((user) => {
    return c.json({user})
  }).catch((e) => {
    c.status(401)
    return c.json({
      message: 'Unauthorized'
    })
  })
}

const logout = async (c: Context) => {
  setCookie(c, 'Authorization', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'manganaya.com',
    maxAge: 0
  })
  return c.redirect(`${redirectUrl}/signin`)
}

export {getMe, logout}