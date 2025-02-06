import axios from 'axios'
import {JSDOM} from 'jsdom'

import {ChapterResultsType} from '@manga-naya/types'
interface ChapterType extends ChapterResultsType {
  genres: string[]
  description: string
}

const sourcesInfo = {
  kakalot: {
    chapters: '.row-content-chapter li',
    link: 'a',
    item: 'a',
    genres: 'tr:nth-child(4) > td.table-value a',
    description: '.panel-story-info-description',
  },
  mangagojo: {
    chapters: '.eplister ul li div div',
    link: 'a',
    item: '.chapternum',
    genres: '.info-desc a',
    description: '.info-desc p',
  }
}

type SourceType = keyof typeof sourcesInfo

const getChapters = (source: SourceType, link: string): Promise<ChapterType[]> => {
  return axios.get(link).then((res: any) => {
    // creating a dom from HTML string
    const dom = new JSDOM(res.data)

    const genresE = [...dom.window.document.querySelectorAll(sourcesInfo[source].genres)]
    const descriptionE = dom.window.document.querySelector(sourcesInfo[source].description) as HTMLElement
    
    const genres = genresE.map(genre => genre.textContent).filter((text): text is string => text !== null)
    
    const description = source === 'kakalot' ? (
      (descriptionE?.textContent?.split('Description :')[1].trim() ?? '')
    ) : (
      (descriptionE?.textContent?.trim() ?? '')
    )

    // Chapters on the page
    const chapters = [...dom.window.document.querySelectorAll(sourcesInfo[source].chapters)]

    // filtering out the chapters with NaN index
    const filteredChapters = chapters.filter(chapter => {
      const indexElement = chapter.querySelector(sourcesInfo[source].item)
      try {
        const numText = indexElement?.textContent?.startsWith('Vol') ? (
          `${indexElement?.textContent?.split(' ')[1]} ${indexElement?.textContent?.split(' ')[2]}`
        ) : (
          indexElement?.textContent
        )
        const index = Number(numText?.split(' ')[1].split(':')[0].replaceAll('-', '.'))
        return !isNaN(index)
      } catch (e) {
        return false
      }
    })

    const chapterItems: ChapterType[] = filteredChapters.map(chapter => {
      const linkElement = chapter.querySelector(sourcesInfo[source].link) as HTMLAnchorElement
      const link = linkElement.href
      const indexElement = chapter.querySelector(sourcesInfo[source].item)
      const numText = indexElement?.textContent?.startsWith('Vol') ? (
        `${indexElement?.textContent?.split(' ')[1]} ${indexElement?.textContent?.split(' ')[2]}`
      ) : (
        indexElement?.textContent
      )
      const index = Number(numText?.split(' ')[1].split(':')[0].replaceAll('-', '.'))

      if (!link) {
        throw new Error(`
          Failed to fetch chapters from ${source},
          link: ${link}
        `)        
      }

      return {
        link,
        index,
        genres,
        description
      }
    })

    return chapterItems
  })
}

export default getChapters