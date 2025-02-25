import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker'
import {Page, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY} from 'puppeteer'

puppeteer.use(StealthPlugin())
puppeteer.use(
  AdBlockerPlugin({
    // Optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    blockTrackers: true,
  })
)

/**
 * Extracts HTML from a given URL
 * @param url The URL to extract HTML from
 * @param headers The headers to use when making the request
 * @returns The HTML from the given URL
 */
const requestHTML = async(url: string, headers: Record<string, string>): Promise<string> => {
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders(headers)
  await page.goto(url, {waitUntil: 'networkidle2'})
  const html = await page.content()
  await browser.close()

  return html
}

export default requestHTML