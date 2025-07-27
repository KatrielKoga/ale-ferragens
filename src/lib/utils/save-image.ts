import fs from 'fs';
import path from 'path';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../s3';

export async function saveImage(imageFile: File) {
  try {
    const ext = imageFile.name.split('.').pop();
    const baseName = imageFile.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 32);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${baseName}-${uniqueSuffix}.${ext}`;
    // Save the file in the public folder
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isProd =
      process.env.NODE_ENV === 'production' || process.env.VERCEL === 'true';

    if (isProd) {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: fileName,
          Body: buffer,
          ContentType: imageFile.type,
          ACL: 'public-read',
        })
      );
      // Return the S3 public URL (adjust if you use a CDN or custom domain)
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } else {
      const imagesDir = path.join(process.cwd(), 'public/images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      const publicPath = path.join(imagesDir, fileName);
      fs.writeFileSync(publicPath, buffer);
      return '/images/' + fileName;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
