import puppeteer, {Page} from 'puppeteer'
import axios from 'axios'

import {PanelType} from '@manga-naya/types'

const sourcesInfo = {
  kakalot: {
    images: '.container-chapter-reader img',
    header: {
      "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "i",
      "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "image",
      "sec-fetch-mode": "no-cors",
      "sec-fetch-site": "cross-site",
      "Referer": "https://chapmanganato.to/",
      "Referrer-Policy": "strict-origin-when-cross-origin"    
    }
  },
  mangagojo: {
    images: '.readerarea img',
    header: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "cross-site",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": "_ga=GA1.1.182291678.1726559320; _ga_6YHPLMWYR9=GS1.1.1726559320.1.1.1726560837.0.0.0; _ga_TZMFKSYPDF=GS1.1.1726581788.2.1.1726582467.0.0.0; FCNEC=%5B%5B%22AKsRol9GjfOFiXGPMaG3a-L5NdwEUCgoRGzPm_cs2xR2YVt1Mbneh1Dht0BPiA8RqrWpRnTf9YzHotVd3WgX8C11SwgAyDmPdgYUuPsi0SB-4-bKMCgOfDzmLaVWaA5GsbbkgXqQuoMiQMfzdH6brY816m7PKAldCQ%3D%3D%22%5D%5D"
    }
  }
}

type SourceType = keyof typeof sourcesInfo

const downloadImages = async(source: SourceType, urls: string[]): Promise<PanelType[]> => {
  return await urls.reduce<Promise<PanelType[]>>(async(acc, url) => {
    const accumulator = await acc
    const response = await axios.get(url, {
      headers: sourcesInfo[source].header,
      responseType: 'arraybuffer'
    }).then((res) => Buffer.from(res.data, 'binary'))

    const filename = url.split('/').pop()!

    const result: PanelType = {
      filename: filename,
      buffer: response
    }

    return [...accumulator, result]
  }, Promise.resolve([]))
}

const extract = async(page: Page, words: string[]) => {
  // Setting the web view height to 10000 and width to 62 to fit all the images, avoiding lazy loading
  await page.setViewport({width: 62, height: 10000})

  // Extracting images
  // '.container-chapter-reader' is the container for the images
  const images = await page.$$eval('img', (imgs) => imgs.map((img) => img.getAttribute('src'))) as string[]

  if(images.length === 0) {
    throw new Error(`Failed to extract images from the page, url: ${page.url()}, images: ${JSON.stringify(images)}`)
  }

  // filtering images urls to only urls that contain at least one of the words
  const filteredImages = images.filter((img) => words.some((word) => {
    if (!word) {
      return false
    }
    return img.includes(word)
  }))
  
  return filteredImages
}

const extractImages = async(source: SourceType, links: string, name: string, chapter: number): Promise<PanelType[]> => {
  try {
    const browser = await puppeteer.launch()

    const words = ['chapter', name, `${chapter}`]

    const page = await browser.newPage()
    await page.goto(links)
    // Extract images
    const imagesLinks = await extract(page, words)
    await page.close()
    await browser.close()
    // Download images
    const images = await downloadImages(source, imagesLinks)

    if (images.length === 0) {
      throw new Error(`Failed to extract images from the page, url: ${links}`)
    }

    return images
  } catch (error) {
    console.log(`Failed to extract images from the page, url: ${links}`, error)
    return []
  }
}

export default extractImages
