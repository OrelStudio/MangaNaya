import jwt from 'jsonwebtoken'
import {getCachedSSMClient} from '@manga-naya/cache'
import {getUser, createUser, removeUser} from '../db'
import type {UserType, UserResultType} from '@manga-naya/types'

const getJWTSecret = async (): Promise<string | undefined> => {
  const node_env = process.env.NODE_ENV

  return node_env === 'development' ? process.env.JWT_SECRET : (async() => {
    const secrets = await getCachedSSMClient()
    const JWT_SECRET = await secrets.getSecureParameter('JWT_SECRET')
    return typeof JWT_SECRET === 'string' ? JWT_SECRET : undefined
  })()
}

const JWT_SECRET = await getJWTSecret()

const addUser = async (email: string, name: string, picture: string): Promise<void> => {
  try {
    await createUser(name, email, picture)
  } catch (e) {
    console.error('Error in addUser', e)
    throw new Error('Error in addUser')
  }
}

const generateToken = async (user: UserType): Promise<string> => {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not found in secrets manager in login')
    throw new Error('something went wrong')
  }

  // Generate token (2 weeks)
  return jwt.sign(user, JWT_SECRET, {expiresIn: '14d'})
}

export {addUser, generateToken}