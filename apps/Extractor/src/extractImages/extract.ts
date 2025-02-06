// import {expect, test} from 'bun:test'
import extractImages, {extract} from './index'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker'
import {Page, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY} from 'puppeteer'
import axios from 'axios'

import {PanelType} from '@manga-naya/types'

puppeteer.use(StealthPlugin())
puppeteer.use(
  AdBlockerPlugin({
    // Optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    blockTrackers: true,
  })
)

extractImages('kakalot', 'https://chapmanganato.to/manga-ng952689/chapter-1', 'naruto', 1).then((chapters) => {
  console.log(chapters)
}).catch((error) => {
  console.error(error)
})


// test('extract', async () => {
//   const browser = await puppeteer.launch({headless: true})
//   const page = await browser.newPage()
//   await page.goto('https://chapmanganato.to/manga-ng952689/chapter-1', { waitUntil: 'networkidle2' })
//   await page.setViewport({ width: 62, height: 10000 })

//   // Wait for all images to load
//   await page.waitForSelector('img')
//   const images = await extract(page, ['chapter', 'naruto', '1'])
//   console.log(images)
  
//   test.each(images)('image %p', (image) => {
//     // image to be a string
//     expect(typeof image).toBe('string')
//   })

//   await page.close()
//   await browser.close()
// })

// test('extractImages', async () => {
//   const link = 'https://chapmanganato.to/manga-ng952689/chapter-1'
//   const chapters = await extractImages('kakalot', link, 'naruto', 1)

//   console.log(chapters)

//   test.each(chapters)('chapter %p', (chapter) => {
//     expect(chapter).toMatchObject({
//       filename: expect.any(String),
//       buffer: expect.any(Buffer),
//     })
//   })
// })