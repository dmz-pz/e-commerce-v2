import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = process.env.IMAGES_DIR || 'C:\\Users\\DMZ\\Videos\\scraping-imagenes-plansuarez\\catalogo_productos';
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'products');

console.log('IMAGES_DIR:', IMAGES_DIR);
console.log('UPLOADS_DIR:', UPLOADS_DIR);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let imagesProcessed = 0;
const categoriesDirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true }).filter(d => d.isDirectory());

for (const catDir of categoriesDirs) {
  const catName = catDir.name;
  const subPath = path.join(IMAGES_DIR, catName);
  const subcategoriesDirs = fs.readdirSync(subPath, { withFileTypes: true }).filter(d => d.isDirectory());

  for (const subDir of subcategoriesDirs) {
    const subName = subDir.name;
    const imgPath = path.join(subPath, subName);
    const images = fs.readdirSync(imgPath, { withFileTypes: true }).filter(f => f.isFile() && /\.(png|webp|jpe?g)$/i.test(f.name));

    for (const img of images) {
      const sourceFilePath = path.join(imgPath, img.name);
      const destFilePath = path.join(UPLOADS_DIR, img.name);
      
      fs.copyFileSync(sourceFilePath, destFilePath);
      imagesProcessed++;
    }
  }
}

console.log(`Copied ${imagesProcessed} images to ${UPLOADS_DIR}`);
