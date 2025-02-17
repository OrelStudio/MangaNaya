import {Client as PgClient} from 'pg'
import getSSMClient from './getSSMClient'

import type {ClientObject} from '../types'

const getDBConfig = async () => {
  const env = process.env.NODE_ENV

  if (env === 'development') {
    return {
      user: 'postgres',
      host: 'localhost',
      database: 'manganaya',
      password: 'orel123',
      port: 5432
    }
  }

  const ssm = await getSSMClient()
  const password = await ssm.client.getSecureParameter('manganaya-db-password')

  if (typeof password !== 'string') {
    throw new Error('Failed to get the database password')
  }

  await ssm.close()

  return {
    user: 'postgres',
    host: 'https://manganaya-db.cn6umsoqy9rd.eu-north-1.rds.amazonaws.com',
    database: 'manganaya',
    password,
    port: 5432
  }
}

const getDBClient = async(): Promise<ClientObject<PgClient>> => {
  const config = await getDBConfig()
  const client = new PgClient(config)
  await client.connect()

  // Initialize the database
  // await initDb(client)

  return {
    client,
    close: async () => {
      await client.end()
    }
  }
}

const initDb = async (client: PgClient): Promise<void> => {
  await client.query(`CREATE TABLE IF NOT EXISTS panel (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapter(id) ON DELETE CASCADE,
    manga_name TEXT NOT NULL,
    index INTEGER NOT NULL,
    chapter_number REAL NOT NULL,
    file_name TEXT NOT NULL,
    UNIQUE(chapter_id, index)
  )`)
  await client.query(`CREATE TABLE IF NOT EXISTS manga (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    thumbnail TEXT,
    genres TEXT[],
    description TEXT
  )`)
  await client.query(`CREATE TABLE IF NOT EXISTS chapter (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
    chapter_number REAL NOT NULL,
    chapter_link TEXT NOT NULL,
    available BOOLEAN DEFAULT FALSE,
    length INTEGER NOT NULL,
    source TEXT NOT NULL,
    UNIQUE(manga_id, chapter_number)
  )`)

  await client.query(`CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    picture TEXT NOT NULL
  )`)

  await client.query(`CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manga_id INTEGER NOT NULL REFERENCES manga(id) ON DELETE CASCADE
  )`)
  
  await client.query(`CREATE TABLE history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id INTEGER NOT NULL REFERENCES chapter(id) ON DELETE CASCADE,
    manga_id INTEGER NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`)
  
  await client.query(`CREATE TABLE reading_list (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manga_id INTEGER NOT NULL REFERENCES manga(id) ON DELETE CASCADE
  )`)
}

export default getDBClient