import fs from "fs";
import path from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Configuración del cliente R2
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.PUBLIC_URL || "https://images.minegociosup.com";
const OPTIMIZED_DIR = path.join(process.cwd(), "generated", "uploads", "optimized_assets");

async function uploadToR2(r2Key: string, fileBuffer: Buffer) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: r2Key,
        Body: fileBuffer,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
    });

    await r2Client.send(command);
    console.log(`[+] Subida completada exitosamente.`);
    console.log(`[+] URL Pública: ${PUBLIC_URL}/${r2Key}`);
}

async function run() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Uso: npx tsx scripts/upload-single-image.ts <ruta_a_la_imagen_original> [ruta_destino_en_bucket]");
        console.error("Ejemplo: npx tsx scripts/upload-single-image.ts scripts/banner.jpg promociones/banner.webp");
        process.exit(1);
    }

    const sourcePath = args[0];
    const parsedPath = path.parse(sourcePath);
    
    // Si el usuario no provee ruta destino en el bucket, usamos una por defecto en formato webp
    const defaultR2Key = `assets/${parsedPath.name}.webp`;
    const r2Key = args[1] || defaultR2Key;

    if (!fs.existsSync(sourcePath)) {
        console.error(`[-] Error: El archivo ${sourcePath} no existe.`);
        process.exit(1);
    }

    try {
        console.log(`[+] Procesando imagen: ${sourcePath}...`);
        
        // Crear directorio temporal si no existe
        if (!fs.existsSync(OPTIMIZED_DIR)) {
            fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
        }

        const localDestPath = path.join(OPTIMIZED_DIR, `${parsedPath.name}.webp`);
        const fileBuffer = fs.readFileSync(sourcePath);

        console.log(`[+] Convirtiendo a formato .webp optimizado (manteniendo tamaño original)...`);
        
        // Convertimos a webp con compresión al 80% (excelente relación calidad-peso)
        const optimizedBuffer = await sharp(fileBuffer)
            .webp({ quality: 80 })
            .toBuffer();
        
        // Guardamos una copia local (opcional, útil para debugear)
        fs.writeFileSync(localDestPath, optimizedBuffer);
        
        console.log(`[+] Subiendo imagen a Cloudflare R2 en la ruta: "${r2Key}"...`);
        await uploadToR2(r2Key, optimizedBuffer);

        console.log("\n🎉 ¡Proceso completado exitosamente!");
        
    } catch (error) {
        console.error("[-] Error durante la ejecución:", error);
    }
}

run();
