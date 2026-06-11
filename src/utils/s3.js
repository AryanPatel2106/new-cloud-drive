import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

function getS3Client() {
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_REGION ||
    !process.env.AWS_S3_BUCKET
  ) {
    throw new Error(
      "AWS S3 configuration is missing! Please make sure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET are defined in your .env file and restart your server."
    );
  }

  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadToS3(fileBuffer, originalName, mimeType){
    const fileKey = Date.now() + "-" + originalName;

    const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  const s3Client = getS3Client();
  await s3Client.send(new PutObjectCommand(params));

  // Construct the public link to access the file
  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  return { 
    url: url, 
    key: fileKey 
  };
}

export async function deleteFromS3(fileKey) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
  };

  const s3Client = getS3Client();
  await s3Client.send(new DeleteObjectCommand(params));
}

export async function getPresignedDownloadUrl(fileKey) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
  };

  const s3Client = getS3Client();
  const command = new GetObjectCommand(params);

  // Generate a signed URL that is valid for 3600 seconds (1 hour)
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}