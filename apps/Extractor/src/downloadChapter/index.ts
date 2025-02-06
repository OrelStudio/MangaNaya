import {updateChapter} from '../saver/db'
import extractImages from '../extractImages'
import {saveChapter} from '../saver'

import {SourceType} from '@manga-naya/types'

type ExtractRequestType = {
  source: SourceType
  index: number
  link: string
  name: string
}

const downloadChapter = async ({source, index, link, name}: ExtractRequestType) => {
  try {
    const panels = await extractImages(source, link, name, index)

    await saveChapter({
      mangaName: name,
      index,
      length: panels.length,
      Panels: panels
    })
    await updateChapter(name, index, true, panels.length)
  } catch (error) {
    console.error(`Failed to download chapter ${index} of ${name}`, error)
  }
}

export default downloadChapter