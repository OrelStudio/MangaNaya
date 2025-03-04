import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker'
import {Page, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY} from 'puppeteer'
import {isThumbnailExist, updateManga} from '../saver/db'
import {saveThumbnail} from '../saver'

import {ThumbnailType} from '@manga-naya/types'

puppeteer.use(StealthPlugin())
puppeteer.use(
  AdBlockerPlugin({
    // Optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    blockTrackers: true,
  })
)

const download = async(link: string, linkToManga: string): Promise<ThumbnailType> => {
  try {
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(false)

    return new Promise(async(resolve, reject) => {
      page.on('response', async (response) => {
        try {
          const url = response.url()
          if (response.request().resourceType() === 'image') {
            if (link === url) {
              const buffer = await response.buffer()
              
              const filename = url.split('/').pop()!
              const thumbnail: ThumbnailType = {thumbnail: buffer, filename}
              resolve(thumbnail)
            }
          }
        } catch (error) {
          console.log(`Error processing response for ${response.url()}`, error)
        }
      })
  
      await page.goto(linkToManga, {waitUntil: 'domcontentloaded'})
      await page.setViewport({width: 62, height: 10000})
  
      await page.waitForSelector('img')
  
      await new Promise((resolve) => setTimeout(resolve, 7000))
  
      await page.close()
      await browser.close()
    })
  } catch (error) {
    console.log(`Error downloading thumbnail for ${linkToManga}`)
    console.log(error)
    throw new Error(`Failed to download thumbnail for ${linkToManga}`)
  }
}

const downloadThumbnail = async(link: string, mangaName: string, linkToManga: string): Promise<void> => {
  console.log(`Downloading thumbnail for `, mangaName)
  
  await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait for 5 seconds before downloading the thumbnail

  const isExist = await isThumbnailExist(mangaName)

  if (isExist) {
    console.log(`Thumbnail for ${mangaName} already exist`)
    return
  }

  const thumbnail = await download(link, linkToManga)
  await saveThumbnail(thumbnail, mangaName)
  await updateManga(mangaName, thumbnail.filename)
}

export default downloadThumbnail