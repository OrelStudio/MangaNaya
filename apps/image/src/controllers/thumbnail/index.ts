import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {GetObjectCommand} from '@aws-sdk/client-s3'
import {getCachedS3Client, getCachedRedisClient} from '@manga-naya/cache'
import {Context} from 'hono'
import {getManga, getCleanName} from '../../db'

const node_env = process.env.NODE_ENV

const getFromCache = async (mangaName: string): Promise<string | null> => {
  const redis = await getCachedRedisClient()
  const thumbnail = await redis.get(`thumbnail-${mangaName}`)
  return thumbnail
}

const setCache = async (mangaName: string, thumbnail: string): Promise<void> => {
  // set with a TTL of 1 hour
  const redis = await getCachedRedisClient()
  await redis.set(`thumbnail-${mangaName}`, thumbnail, {EX: 3600})
}

const getImage = async (mangaName: string, filename: string): Promise<string> => {
  const s3 = await getCachedS3Client()
  const bucketName = 'manga-naya-bucket'
  
  const params = {
    Bucket: bucketName,
    Key: `${mangaName}/${filename}`
  }

  const command = new GetObjectCommand(params)
  const url = await getSignedUrl(s3, command, {expiresIn: 3600})
  return url
}

const getImageLocal = async (mangaName: string, filename: string): Promise<string> => {
  const port = process.env.IMG_PORT || 5050
  const localPath = `http://localhost:${port}`
  return `${localPath}/${mangaName}/${filename}`
}

const getImageLink = node_env === 'development' ? getImageLocal : getImage

const getThumbnail = async (c: Context): Promise<string> => {
  const id = c.req.param('id')
  const idInt = parseInt(id, 10)

  if (!idInt) {
    return 'Bad Request'
  }

  const manga = await getManga(idInt)

  if (!manga) {
    return 'Not Found'
  }

  const cached = await getFromCache(manga.name)
  const cleanMangaName = getCleanName(manga.name)

  if (cached) {
    return cached
  }

  const url = await getImageLink(cleanMangaName, manga.thumbnail)
  await setCache(manga.name, url)

  return url
}

export default getThumbnail
