import {expect, test} from 'bun:test'
import getChapters from './index'

import {ChapterResultsType} from '@manga-naya/types'
interface ChapterType extends ChapterResultsType {
  genres: string[]
  description: string
}

test('getChapters', async () => {
  const chapters = await getChapters('kakalot', 'https://chapmanganato.to/manga-ng952689')

  console.log(chapters)
  

  test.each(chapters)('chapter %p', (chapter) => {
    expect(chapter).toMatchObject({
      index: expect.any(Number),
      link: expect.any(String),
      title: expect.any(String),
      genres: expect.any(Array),
      description: expect.any(String),
    })
  })
})
