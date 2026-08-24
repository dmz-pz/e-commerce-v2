import odbc from 'odbc';
import { prisma, shutdownDatabase } from '../server/api/db';
import { UnitType } from '../generated/prisma/enums';

const DSN = process.env.ODBC_DSN;
const UID = process.env.ODBC_UID;
const PWD = process.env.ODBC_PWD;
const connectionString = `DSN=${DSN};UID=${UID};PWD=${PWD}`;

async function dailySync() {
  console.log(`[+] Iniciando sincronización DIARIA (Delta) con base de datos externa...`);
  
  // 1. Calcular la fecha de ayer para el filtro
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const fechaFiltro = ayer.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  console.log(`[+] Buscando productos modificados desde: ${fechaFiltro}`);

  const RATE_QUERY = `SELECT tasa_vig FROM DBA.tb_moneda WHERE cod_internacional = 'USD'`;

  const SYNC_QUERY = `
  SELECT 
      p.cod_interno,
      b.cod_barra,
      p.txt_descripcion_corta,
      p.txt_descripcion_larga,
      p.ind_inactivo,
      p.ind_pesado, 
      imp.cod_impuesto,
      imp.porc_impuesto,
      pre.mto_moneda AS precio_usd
  FROM DBA.tv_producto AS p
  INNER JOIN DBA.tv_barra AS b ON p.cod_interno = b.cod_interno
  INNER JOIN DBA.td_tipo_impuesto AS imp ON p.cod_impuesto = imp.cod_impuesto
  CROSS APPLY (
      SELECT TOP 1 mto_precio, mto_moneda, fecha_cambio 
      FROM DBA.ta_precio_producto 
      WHERE cod_interno = p.cod_interno AND mto_moneda > 0
      ORDER BY fecha_cambio DESC
  ) AS pre
  WHERE p.ind_inactivo = 'A' AND pre.fecha_cambio >= '${fechaFiltro}'
  `;

  let connection;
  try {
    connection = await odbc.connect(connectionString);
  } catch (error) {
    console.error('[-] Error al conectar con ODBC:', error);
    process.exit(1);
  }

  // --- PASO A: ACTUALIZAR LA TASA DEL DÓLAR ---
  try {
    console.log('[+] Obteniendo Tasa de Cambio actual...');
    const rateRows = await connection.query(RATE_QUERY);
    
    if (rateRows.length > 0 && rateRows[0].tasa_vig) {
      const tasaVig = Number(rateRows[0].tasa_vig);
      console.log(`[+] Sincronizando Tasa de Cambio actual en BD local: ${tasaVig}`);
      const exchangeRate = await prisma.exchangeRate.findFirst();
      
      if (exchangeRate) {
        await prisma.exchangeRate.update({
          where: { id: exchangeRate.id },
          data: { rate: tasaVig }
        });
      } else {
        await prisma.exchangeRate.create({
          data: { rate: tasaVig, currency: 'VES' }
        });
      }
    } else {
      console.log('[-] Advertencia: No se encontró la tasa de cambio en la BD externa.');
    }
  } catch (error) {
    console.error('[-] Error obteniendo o actualizando la tasa de cambio:', error);
    // Continuamos de todas formas para intentar actualizar los productos
  }

  // --- PASO B: ACTUALIZAR EL CATÁLOGO (DELTA) ---
  let rows;
  try {
    console.log('[+] Ejecutando consulta Delta de Productos en ODBC...');
    rows = await connection.query(SYNC_QUERY);
  } catch (error) {
    console.error('[-] Error ejecutando la consulta de productos:', error);
    await connection.close();
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('[-] No se encontraron productos modificados recientemente.');
    await connection.close();
    await shutdownDatabase();
    return; // Aquí podemos hacer el 'return' sin miedo, porque la tasa ya se actualizó
  }

  console.log(`[+] Encontrados ${rows.length} productos con cambios recientes.`);

  // Obtener categorías por defecto en caso de crear un producto nuevo
  let defaultCategory = await prisma.category.findUnique({ where: { name: 'Sin Categorizar' } });
  if (!defaultCategory) {
    defaultCategory = await prisma.category.create({ data: { name: 'Sin Categorizar' } });
  }

  let defaultSubcategory = await prisma.subcategory.findFirst({
    where: { name: 'Varios', categoryId: defaultCategory.id }
  });
  if (!defaultSubcategory) {
    defaultSubcategory = await prisma.subcategory.create({
      data: { name: 'Varios', categoryId: defaultCategory.id }
    });
  }

  console.log('[+] Actualizando base de datos local (Productos)...');
  let successCount = 0;

  for (const row of rows) {
    const codImpuesto = String(row.cod_impuesto);
    const percentage = Number(row.porc_impuesto);
    const taxName = percentage > 0 ? `IVA ${percentage}%` : 'Exento';

    let taxRate = await prisma.taxRate.findUnique({ where: { code: codImpuesto } });
    if (!taxRate) {
      taxRate = await prisma.taxRate.create({
        data: { code: codImpuesto, name: taxName, percentage }
      });
    }

    const isActive = row.ind_inactivo === 'A';
    const unit = (row.ind_pesado === 1 || row.ind_pesado === '1') ? UnitType.KG : UnitType.UNID;
    const price = row.precio_usd ? Number(row.precio_usd) : 0;
    const externalId = String(row.cod_interno);
    const barcode = row.cod_barra ? String(row.cod_barra) : null;

    try {
      await prisma.product.upsert({
        where: { externalId },
        update: {
          name: row.txt_descripcion_corta || 'Sin Nombre',
          description: row.txt_descripcion_larga || '',
          barcode,
          price,
          unit,
          isActive,
          taxRateId: taxRate.id
        },
        create: {
          externalId,
          name: row.txt_descripcion_corta || 'Sin Nombre',
          description: row.txt_descripcion_larga || '',
          barcode,
          price,
          unit,
          isActive,
          taxRateId: taxRate.id,
          subcategoryId: defaultSubcategory.id,
          stock: 0
        }
      });
      successCount++;
    } catch (e) {
      console.error(`[-] Error al hacer upsert del producto ${externalId}:`, e);
    }
  }

  console.log(`[+] Sincronización diaria completada: Tasa actualizada y ${successCount} productos procesados.`);

  await connection.close();
  await shutdownDatabase();
}

dailySync().catch(e => {
  console.error(e);
  process.exit(1);
});
