/**
 * S3 storage utility functions for managing sample media files
 */

let s3Client: any = null

export async function initS3() {
  if (s3Client) return s3Client

  // Dynamic import to avoid issues during build
  const { S3Client } = await import('@aws-sdk/client-s3')

  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  })

  return s3Client
}

export async function uploadFile(
  key: string,
  body: Buffer | string,
  contentType: string
): Promise<string> {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3')
  const s3 = await initS3()

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    )

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
    return fileUrl
  } catch (error) {
    console.error('Error uploading file to S3:', error)
    throw error
  }
}

export async function getFileUrl(key: string): Promise<string> {
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
}

export async function deleteFile(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
  const s3 = await initS3()

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
    )
  } catch (error) {
    console.error('Error deleting file from S3:', error)
    throw error
  }
}
