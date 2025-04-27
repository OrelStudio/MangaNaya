import {JSDOM} from 'jsdom'
import getHeaders from '../headers/getHeaders'
import requestHTML from '../requestHTML'
// import {getSSMClient} from '@manga-naya/cache'
import type {RedisType} from '@manga-naya/cache'

const sourceOne = process.env.SOURCEONE
const sourceTwo = process.env.SOURCETWO

import {MangaItemType} from '@manga-naya/types'
type MangaType = Omit<MangaItemType, 'genres' | 'description'> & { source: 'sourceOne' | 'sourceTwo' }

const sourcesInfo = {
  sourceOne: {
    url: (query: string, page: number) => `${sourceOne}/${query}?page=${page}`,
    items: '.story_item',
    title: '.story_name a',
    thumbnail: 'img'
  },
  sourceTwo: {
    url: (query: string, page: number) => `${sourceTwo}/${page}/?s=${query}`,
    items: '.bs',
    title: '.tt',
    thumbnail: 'img'
  }
}
// sourcesInfo[source].url}${page}
type SourceType = keyof typeof sourcesInfo

const searchMangas = (source: SourceType, query: string, page: number): Promise<MangaType[]> => {
  const cleanQuery = query.replace(/ /g, '_')

  const headers = getHeaders()
  return requestHTML(sourcesInfo[source].url(cleanQuery, page), headers).then((res) => {
    // creating a dom from HTML string
    const dom = new JSDOM(res)

    // Mangas on the page
    const items = [...dom.window.document.querySelectorAll(sourcesInfo[source].items)]
    
    const mangaItems: MangaType[] = items.map(item => {
      const title = item.querySelector(sourcesInfo[source].title) as HTMLElement & {title: string}
      const thumbnailElement = item.querySelector(sourcesInfo[source].thumbnail) as HTMLImageElement
      const thumbnailLink = thumbnailElement.src

      if (!title.textContent || !item.querySelector('a')) {
        throw new Error(`
          Failed to fetch chapters from ${source},
          title: ${title.textContent}
        `)
      }

      const link = source === 'sourceOne' ? (title as HTMLAnchorElement).href : item.querySelector('a')!.href as string

      const mangaItem: MangaType = {
        name: title.textContent.trim(),
        linkToManga: link,
        thumbnailLink,
        source
      }

      return mangaItem
    })

    return mangaItems
  })
}

const search = async (query: string, page: number, redisClient: RedisType): Promise<MangaType[]> => {
  const mangasOne = await searchMangas('sourceOne', query, page)
  const mangasMangaTwo = await searchMangas('sourceTwo', query, page)

  // Merge the two arrays without duplicates based on the manga name
  const mangas = mangasOne.concat(mangasMangaTwo.filter(manga => {
    return !mangasOne.some(mangaOne => mangaOne.name === manga.name)
  }))

  if (mangas.length === 0) {
    console.log(`No mangas found for query: ${query}`)
    await redisClient.del(`s-${query}`)
  }

  return mangas
}

export default search