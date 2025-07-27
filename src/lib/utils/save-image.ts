import fs from 'fs';
import path from 'path';

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
    const imagesDir = path.join(process.cwd(), 'public/images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    const publicPath = path.join(imagesDir, fileName);
    fs.writeFileSync(publicPath, buffer);
    return '/images/' + fileName;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
