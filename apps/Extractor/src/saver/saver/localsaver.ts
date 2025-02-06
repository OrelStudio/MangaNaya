import fs from 'node:fs/promises'
import path from 'node:path'

const basePath = 'D:/Manga/local/'

const saveToLocal = async (
  filename: string,
  relativePath: string,
  contentType: string,
  data: Buffer
): Promise<void> => {
  const fullDirPath = path.join(basePath, relativePath)
  const fullFilePath = path.join(fullDirPath, filename)

  // Ensure directory exists
  await fs.mkdir(fullDirPath, {recursive: true})

  // Write the file
  await fs.writeFile(fullFilePath, data)

  console.log(`File saved at: ${fullFilePath}`)
}

export default saveToLocal