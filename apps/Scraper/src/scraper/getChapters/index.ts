import {JSDOM} from 'jsdom'
import getHeaders from '../headers/getHeaders'
import requestHTML from '../requestHTML'

import {ChapterResultsType} from '@manga-naya/types'
interface ChapterType extends ChapterResultsType {
  genres: string[]
  description: string
}

const sourcesInfo = {
  kakalot: {
    chapters: '.chapter-list .row',
    link: 'a',
    item: 'a',
    genres: 'li.genres a',
    description: '#contentBox',
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
  const headers = getHeaders()
  return requestHTML(link, headers).then((res) => {
    // creating a dom from HTML string
    const dom = new JSDOM(res)

    const genresE = [...dom.window.document.querySelectorAll(sourcesInfo[source].genres)]
    const descriptionE = dom.window.document.querySelector(sourcesInfo[source].description) as HTMLElement
    
    const genres = genresE.map(genre => genre.textContent ? genre.textContent.trim() : null).filter((text): text is string => text !== null)

    console.log(genres)
    
    const description = source === 'kakalot' ? (
      (descriptionE?.textContent?.split('summary:')[1].trim() ?? '')
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