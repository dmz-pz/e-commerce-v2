import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';

// Configuración del cliente S3 para Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const PUBLIC_DOMAIN = 'https://images.minegociosup.com';

export interface UploadResult {
  fullUrl: string;
  thumbUrl: string;
}

export class StorageService {
  /**
   * Procesa la imagen con Sharp y la sube a Cloudflare R2
   * @param fileBuffer Buffer de la imagen obtenida por multer
   * @param folder Carpeta virtual dentro del bucket (ej. 'products' o 'payments')
   * @returns Un objeto con las URLs públicas de las versiones full y thumb
   */
  async uploadImage(fileBuffer: Buffer, folder: string = 'products'): Promise<UploadResult> {
    const uniqueId = crypto.randomUUID();
    const basePath = `${folder}/${uniqueId}`;

    // 1. Procesar imágenes en paralelo con Sharp
    const [fullBuffer, thumbBuffer] = await Promise.all([
      // Versión Full: Escalada a máx 1000x1000 px
      sharp(fileBuffer)
        .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer(),

      // Versión Thumb: Recorte cuadrado a 300x300 px
      sharp(fileBuffer)
        .resize({ width: 300, height: 300, fit: 'cover' })
        .webp({ quality: 75 })
        .toBuffer(),
    ]);

    // Nombres de archivos finales
    const fullKey = `${basePath}-full.webp`;
    const thumbKey = `${basePath}-thumb.webp`;

    // 2. Subir ambos buffers a R2 en paralelo
    const uploadParams = {
      Bucket: BUCKET_NAME,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    };

    await Promise.all([
      s3Client.send(
        new PutObjectCommand({
          ...uploadParams,
          Key: fullKey,
          Body: fullBuffer,
        })
      ),
      s3Client.send(
        new PutObjectCommand({
          ...uploadParams,
          Key: thumbKey,
          Body: thumbBuffer,
        })
      ),
    ]);

    // 3. Retornar URLs públicas
    return {
      fullUrl: `${PUBLIC_DOMAIN}/${fullKey}`,
      thumbUrl: `${PUBLIC_DOMAIN}/${thumbKey}`,
    };
  }

  /**
   * Sube un archivo genérico (ej. recibo PDF que no es imagen)
   */
  async uploadFile(fileBuffer: Buffer, mimetype: string, extension: string, folder: string = 'payments'): Promise<string> {
    const uniqueId = crypto.randomUUID();
    const key = `${folder}/${uniqueId}${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return `${PUBLIC_DOMAIN}/${key}`;
  }
}

export const storageService = new StorageService();
