import {S3Client} from '@aws-sdk/client-s3'

import type {ClientObject} from '../types'

const getS3Client = async(): Promise<ClientObject<S3Client>> => {
  const s3 = new S3Client({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

  return {
    client: s3,
    close: async() => {
      s3.destroy()
    }
  }
}

export default getS3Client