import {S3Client} from '@aws-sdk/client-s3'

import type {ClientObject} from '../types'

const getS3Client = async(): Promise<ClientObject<S3Client>> => {
  const s3 = new S3Client({region: 'eu-north-1'})

  return {
    client: s3,
    close: async() => {
      s3.destroy()
    }
  }
}

export default getS3Client