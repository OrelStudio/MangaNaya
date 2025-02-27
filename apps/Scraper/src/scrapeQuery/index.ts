import amqplib from 'amqplib'
import {from, of, defer, catchError} from 'rxjs'
import {mergeMap, concatMap, delay, tap} from 'rxjs/operators'
import {RedisType} from '@manga-naya/cache'

import {insertManga, updateManga, insertChapter} from '../saver/db'

import search from '../scraper/searchMangas'
import getChapters from '../scraper/getChapters'

import type {MangaItemType, ChapterResultsType, SourceType} from '@manga-naya/types'
type MangaType = MangaItemType & {source: SourceType}
type RawMangaType = Omit<MangaItemType, 'genres' | 'description'> & { source: SourceType }

interface ChapterType extends ChapterResultsType {
  genres: string[]
  description: string
}

const requestThumbnail = (
  channel: amqplib.Channel,
  queue: string, // queue to request the thumbnail from
  source: SourceType,
  name: string,
  thumbnailLink: string
) => {
  const message = JSON.stringify({
    source,
    name, // manga name
    thumbnailLink
  })

  console.log(`[x] Requesting Thumbnail for ${name}`)
  channel.sendToQueue(queue, Buffer.from(message), {
    persistent: true
  })
}

const createChapterObservable = (
  chapters: ChapterType[],
  mangaName: string,
  source: SourceType
) => {
  return from(chapters).pipe(
    concatMap((chapter) => {
      return of(chapter).pipe(
        tap(() => {
          updateManga(mangaName, chapter.genres, chapter.description).then(() => {
          }).catch((error) => {
            console.error('Failed to update manga', error)
          })
        }),
        // send a message to the queue
        mergeMap(async () => await insertChapter(mangaName, chapter.index, chapter.link, source)),
      )},
    ),
    tap({
      complete: () => console.log(`Finished requesting all chapters for ${mangaName}, chapters: ${chapters.length}`),
    }),
    catchError((error, caught) => {
      console.error('Failed to get chapters', error)
      return caught
    })
  )
}

const createMangaObservable = (
  mangas: RawMangaType[],
  delayTime: number,
  channel: amqplib.Channel,
  queue: string
) => {
  return from(mangas).pipe(
    concatMap((manga) =>
      defer(() => {
        console.log(`Starting to Request ${manga.name}`)
        return from(getChapters(manga.source, manga.linkToManga)).pipe(
          tap(async(chapters) => {
            console.log(`Finished Requesting ${manga.name} chapters: ${chapters.length}, source: ${manga.source}, link: ${manga.linkToManga}`)
            requestThumbnail(channel, queue, manga.source, manga.name, manga.thumbnailLink)
            await insertManga(manga.name)
          }),
          mergeMap((chapters) => createChapterObservable(chapters, manga.name, manga.source)),
          delay(delayTime)
        )
      })
    ),
    catchError((error, caught) => {
      console.error('Failed to get mangas', error)
      return caught
    })
  )
}

const scrapeQuery = async (
  channel: amqplib.Channel,
  queue: string,
  delayTime: number,
  redisClient: RedisType,
  query: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    from(search(query, 1, redisClient)).pipe(
      mergeMap((mangas) => createMangaObservable(mangas, delayTime, channel, queue))
    ).subscribe({
      complete: () => {
        resolve()
      },
      error: (err) => {
        reject(err)
      },
    })
  })
}

export default scrapeQuery