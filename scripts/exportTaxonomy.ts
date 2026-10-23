import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const IMAGES_DIR = process.env.IMAGES_DIR || 'C:\\Users\\DMZ\\Videos\\scraping-imagenes-plansuarez\\catalogo_productos';
const OUTPUT_FILE = path.join(process.cwd(), 'prisma', 'data', 'taxonomy-mapping.json');

interface TaxonomyStructure {
  categories: Array<{
    name: string;
    subcategories: string[];
  }>;
  products: Record<string, { category: string; subcategory: string }>;
}

async function exportTaxonomy(): Promise<void> {
  console.log(`[+] Leyendo estructura de carpetas desde: ${IMAGES_DIR}...`);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`[-] Error: El directorio de imágenes no existe en la ruta: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const result: TaxonomyStructure = {
    categories: [],
    products: {}
  };

  const categoryDirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true }).filter(d => d.isDirectory());

  for (const catDir of categoryDirs) {
    const catName = catDir.name.trim();
    const catPath = path.join(IMAGES_DIR, catDir.name);
    const subDirs = fs.readdirSync(catPath, { withFileTypes: true }).filter(d => d.isDirectory());

    const subcategoryNames: string[] = [];

    for (const subDir of subDirs) {
      const subName = subDir.name.trim();
      subcategoryNames.push(subName);

      const subPath = path.join(catPath, subDir.name);
      const imageFiles = fs.readdirSync(subPath, { withFileTypes: true })
        .filter(f => f.isFile() && /\.(png|webp|jpe?g)$/i.test(f.name));

      for (const img of imageFiles) {
        const barcode = path.parse(img.name).name.trim();
        if (barcode) {
          result.products[barcode] = {
            category: catName,
            subcategory: subName
          };
        }
      }
    }

    result.categories.push({
      name: catName,
      subcategories: subcategoryNames
    });
  }

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');

  const totalProducts = Object.keys(result.products).length;
  console.log(`✅ Extracción exitosa:`);
  console.log(`   - Categorías encontradas: ${result.categories.length}`);
  console.log(`   - Productos mapeados con código de barras: ${totalProducts}`);
  console.log(`   - Archivo generado en: ${OUTPUT_FILE}`);
}

exportTaxonomy().catch(err => {
  console.error('[-] Error fatal durante la extracción:', err);
  process.exit(1);
});
