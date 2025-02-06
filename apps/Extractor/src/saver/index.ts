import {insertPanel} from './db'
import saveToS3 from './saver'
import saveToLocal from './saver/localsaver'

import {ChapterType, ThumbnailType} from '@manga-naya/types'

const node_env = process.env.NODE_ENV

const save = node_env === 'development' ? saveToLocal : saveToS3

/**
 * @description add chapter to the db and save it locally
 * @param {ChapterType} chapter
 * @param {string} path - path to global manga storage
 */
const saveChapter = async(chapter: ChapterType): Promise<void> => {
  const cleanMangaName = chapter.mangaName.replace(/[\/\\:*?"&<>|]/g, '_')
  
  chapter.Panels.forEach((panel, i) => {
    const contentType = `image/${panel.filename.split('.').at(-1)}`
    save(panel.filename, `${cleanMangaName}/${chapter.index}`, contentType, panel.buffer).then(() => {
      // save panel to db
      insertPanel(chapter.mangaName, i + 1, chapter.index, panel.filename).then(() => {
        console.log(`saved panel ${i + 1} of chapter ${chapter.index} of manga ${chapter.mangaName}`)
      }).catch((error) => {
        console.log(`failed to add panel to DB, manga: ${chapter.mangaName} chapter: ${chapter.index} panel: ${i + 1}`)
      })
    }).catch((error) => {
      console.log(`failed to add chapter to DB, manga: ${chapter.mangaName} chapter: ${chapter.index}`)
    })
  })
}

const saveThumbnail = async(thumbnail: ThumbnailType, mangaName: string): Promise<void> => {
  const cleanMangaName = mangaName.replace(/[\/\\:*?"&<>|]/g, '_')
  const contentType = `image/${thumbnail.filename.split('.').at(-1)}`

  await save(thumbnail.filename, cleanMangaName, contentType, thumbnail.thumbnail)
}

export {
  saveChapter,
  saveThumbnail
}