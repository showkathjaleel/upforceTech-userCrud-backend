import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
  } from '@aws-sdk/client-s3'
  import * as dotenv from 'dotenv'
dotenv.config()
import crypto from 'crypto'
import sharp from 'sharp'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
console.log(process.env.BUCKET_SECRET_KEY,'0000000000000')
const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.BUCKET_ACCESS_KEY
const secretAccessKey = process.env.BUCKET_SECRET_KEY

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey
  },
  region: bucketRegion
})

export default s3


// const randomImageName = (bytes = 32) =>
// crypto.randomBytes(bytes).toString('hex')

// export const getImagesfromS3 = async (imageUrl) => {
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: imageUrl
//     }
//     console.log(getObjectParams, '22222222222222222222')
//     const command = new GetObjectCommand(getObjectParams)
//     console.log(command, '33333333333333333333333333')
//     const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
//     return url
//   }
  
// export   const putImagestoS3 = async (file) => {
  
//     const imageName = randomImageName()
//     console.log(imageName, 'imageName')
//     const params = {
//       Bucket: bucketName,
//       Key: imageName,
//       Body: file.buffer,
//       ContentType: file.mimetype
//     }
//     console.log('params', params)
//     const command = new PutObjectCommand(params)
//     console.log('command', command)
//     const response = await s3.send(command)
//     console.log(response, 'response')
//     return imageName
//   }
  
//  export const deleteImagesfromS3 = async (imageName) => {
//     const params = {
//       Bucket: bucketName,
//       Key: imageName
//     }
//     console.log(params, '444444444444444444444444444444')
//     const command = new DeleteObjectCommand(params)
//     console.log(command, '555555555555555555555555')
//     const response = await s3.send(command)
//     console.log(response, '6666666666666666666666')
//     return 'success'
//     // const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
//   }
  