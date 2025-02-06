import {PutObjectCommand} from '@aws-sdk/client-s3'
import {getCachedS3Client} from '@manga-naya/cache'

// cloud saver on aws s3
const saveToS3 = async (
  filename: string,
  path: string,
  contentType: string,
  data: Buffer
): Promise<void> => {
  const s3 = await getCachedS3Client()
  const bucketName = 'manga-naya-bucket'

  try {
    // Upload the object to S3
    const params = {
      Bucket: bucketName,
      Key: path ? `${path}/${filename}` : filename,
      Body: data,
      ContentType: contentType,
    }

    const command = new PutObjectCommand(params)
    await s3.send(command)

    console.log(`Saved file: ${filename} to S3 in bucket '${bucketName}'`)
  } catch (err) {
    console.log(`Failed to save file: ${filename} to S3`)
    console.error(err)
    throw err // Re-throw the error after logging
  }
}

export default saveToS3