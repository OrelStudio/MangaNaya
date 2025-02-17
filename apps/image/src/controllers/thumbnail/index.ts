import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {GetObjectCommand} from '@aws-sdk/client-s3'
import {getCachedS3Client} from '@manga-naya/cache'
import {Context} from 'hono'
import {getManga, getCleanName} from '../../db'
import path from 'node:path'
import fs from 'node:fs/promises'

const node_env = process.env.NODE_ENV

const getImage = async (mangaName: string, filename: string): Promise<Buffer> => {
  const s3 = await getCachedS3Client()
  const bucketName = 'manga-naya-bucket'
  
  const params = {
    Bucket: bucketName,
    Key: `${mangaName}/${filename}`
  }

  const command = new GetObjectCommand(params)
  const response = await s3.send(command)
  const body = response.Body

  if (!body) {
    throw new Error('Failed to get image')
  }

  const uint8Array = await body.transformToByteArray()
  const buffer = Buffer.from(uint8Array)

  return buffer
}

const getImageLocal = async (mangaName: string, filename: string): Promise<Buffer> => {
  const localPath = `D:/Manga/local`
  const fullFilePath = path.join(localPath, mangaName, filename)

  const data = await fs.readFile(fullFilePath)
  return data
}

const getImageBuffer = node_env === 'development' ? getImageLocal : getImage

const getThumbnail = async (c: Context): Promise<Buffer> => {
  const id = c.req.param('id')
  const idInt = parseInt(id, 10)

  if (!idInt) {
    throw new Error('Bad Request')
  }

  const manga = await getManga(idInt)

  if (!manga) {
    throw new Error('Not Found')
  }

  const cleanMangaName = getCleanName(manga.name)

  const contentType = `image/${manga.thumbnail.split('.').at(-1)}`
  const imageBuffer = await getImageBuffer(cleanMangaName, manga.thumbnail)
  c.res.headers.set('Content-Type', contentType)
  c.res.headers.set('Content-Disposition', `inline; filename="${manga.thumbnail}"`)

  return imageBuffer
}

export default getThumbnail
