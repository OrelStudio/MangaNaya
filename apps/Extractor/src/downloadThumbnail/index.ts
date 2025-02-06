import axios from 'axios'

import {isThumbnailExist, updateManga} from '../saver/db'
import {saveThumbnail} from '../saver'

import {ThumbnailType} from '@manga-naya/types'

const download = async(link: string): Promise<ThumbnailType> => {
  try {
    const buffer = await axios.get(link, {responseType: 'arraybuffer'}).then((res) => Buffer.from(res.data, 'binary'))
    const filename = link.split('/').pop()!

    const thumbnail: ThumbnailType = {
      thumbnail: buffer,
      filename
    }

    return thumbnail
  } catch (error) {
    return {
      thumbnail: Buffer.from(''),
      filename: 'error'
    }
  }
}

const downloadThumbnail = async(link: string, mangaName: string): Promise<void> => {
  console.log(`Downloading thumbnail for `, mangaName);
  
  const isExist = await isThumbnailExist(mangaName)

  if (isExist) {
    console.log(`Thumbnail for ${mangaName} already exist`)
    return
  }

  const thumbnail = await download(link)
  await saveThumbnail(thumbnail, mangaName)
  await updateManga(mangaName, thumbnail.filename)
}

export default downloadThumbnail