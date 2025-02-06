import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {GetObjectCommand} from '@aws-sdk/client-s3'
import {getCachedS3Client} from '@manga-naya/cache'
import fs from 'node:fs/promises'
import path from 'node:path'
import {Context} from 'hono'
import {getChapter, getPanel as panel, getCleanName} from '../../db'

const node_env = process.env.NODE_ENV

const getImageS3 = async (mangaName: string, key: string): Promise<Buffer> => {
  const s3 = await getCachedS3Client()
  const bucketName = 'manga-naya-bucket'
  
  const params = {
    Bucket: bucketName,
    Key: `${mangaName}/${key}`
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

const getImageLocal = async (mangaName: string, key: string): Promise<Buffer> => {
  const localPath = 'D:/Manga/local'
  const fullFilePath = path.join(localPath, mangaName, key)
  console.log('Reading file:', fullFilePath)
  
  const data = await fs.readFile(fullFilePath)
  return data
}

const getImage = node_env === 'development' ? getImageLocal : getImageS3

const getPanel = async(c: Context): Promise<Buffer> => {
  const chapterId = c.req.param('id')
  const indexParam = c.req.query('i')

  const id = parseInt(chapterId, 10)
  const index = parseInt(indexParam || '', 10)

  if (!id || !index) {
    throw new Error('Bad Request')
  }

  const chapter = await getChapter(id)
  const requestedPanel = await panel(id, index)
  const mangaName = getCleanName(requestedPanel.manga_name)
  const contentType = `image/${requestedPanel.file_name.split('.').at(-1)}`
  const image = await getImage(mangaName, `${chapter.chapter_number}/${requestedPanel.file_name}`)
  c.res.headers.set('Content-Type', contentType)
  c.res.headers.set('Content-Disposition', `inline; filename="${requestedPanel.file_name}"`)

  return image
}

export default getPanel