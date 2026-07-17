// ==========================================
// CONFIGURACIÓN DE INFRAESTRUCTURA
// ==========================================

datasource db {
provider = "postgresql"
}

generator client {
provider = "prisma-client"
output = "../generated/prisma"
moduleFormat = "esm"
generatedFileExtension = "ts"
importFileExtension = "ts"
}

// ==========================================
// ENUMS (REGLAS DE NEGOCIO ESTRICTAS)
// ==========================================

enum Role {
CLIENTE
ADMINISTRADOR
STAFF_PICKER
DELIVERY
}

enum OrderStatus {
PENDING
PICKING
READY_TO_PAY
PAID
DELIVERED
CANCELLED
}

enum ItemStatus {
COMPLETED
PARTIAL
SUBSTITUTED
CANCELLED
}

enum FulfillmentMethod {
DELIVERY
PICK_UP
}

enum PaymentMethod {
PAGO_MOVIL // Digital manual (Verificación de captura/referencia)
ZELLE // Digital manual (Verificación de captura/referencia)
BINANCE // Digital manual (Verificación de captura/referencia)
EFECTIVO_DELIVERY // Cobro en sitio por el delivery o pick-up
PUNTO_DELIVERY // Cobro en sitio con tarjeta por el delivery o en sucursal
}

enum PaymentStatus {
PENDING
APPROVED
REJECTED
}

enum UnitType {
UNID
KG
GR
// Puedes añadir otros a futuro como LITRO o PACK
}

// ==========================================
// MÓDULO 1: USUARIOS, ROLES Y ACCESOS
// ==========================================

model User {
id String @id @default(uuid())
cedula String @unique
firstName String
lastName String
phone String
email String @unique
passwordHash String  
 birthdate DateTime?
role Role @default(CLIENTE)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Campo para Borrado Lógico
deletedAt DateTime?

// Relaciones virtuales
addresses Address[]
orders Order[] @relation("CustomerOrders")
ordersPicked Order[] @relation("PickerOrders")
ordersDelivered Order[] @relation("DeliveryOrders")
auditActions AuditLog[] @relation("UserAudited")

@@map("users")
}

model Address {
id String @id @default(uuid())
alias String // Ej: "Casa", "Trabajo"
line1 String  
 line2 String?
userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@map("addresses")
}

// ==========================================
// MÓDULO 2: CATÁLOGO DE PRODUCTOS (PIM)
// ==========================================

model Category {
id String @id @default(uuid())
name String @unique
subcategories Subcategory[]
@@map("categories")
}

model Subcategory {
id String @id @default(uuid())
name String
categoryId String
category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
products Product[]

@@unique([name, categoryId])
@@map("subcategories")
}

model Product {
id String @id @default(uuid())
name String
description String @db.Text
barcode String? @unique
price Decimal @db.Decimal(10, 2)
discountPrice Decimal? @db.Decimal(10, 2)
stock Int @default(0)
brand String?
rating Float @default(0.0)
reviewCount Int @default(0)
specifications Json?
unit UnitType @default(UNID)
isRecommended Boolean @default(false)
salesCount Int @default(0)
isActive Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relaciones
images ProductImage[]
subcategoryId String
subcategory Subcategory @relation(fields: [subcategoryId], references: [id])
orderItems OrderItem[]
substitutedInItems OrderItem[] @relation("SubstitutedWithProduct")

// 🚀 ÍNDICES SENIOR: Optimización de búsquedas y navegación por categorías
@@index([subcategoryId])
@@index([name])
@@map("products")
}

model ProductImage {
id String @id @default(uuid())
productId String
product Product @relation(fields: [productId], references: [id])
url String
order Int?
}

// ==========================================
// MÓDULO 3: TRANSACCIONES Y MULTI-ESTADOS (PICKING)
// ==========================================

model Order {
id String @id @default(uuid()) // Corregido: ID automático
customerId String  
 customer User @relation("CustomerOrders", fields: [customerId], references: [id], onDelete: Restrict)

fulfillmentMethod FulfillmentMethod @default(DELIVERY)
deliveryAddress String? // Captura de texto libre (Inmutabilidad)

// Datos históricos del cliente al momento de la compra (Inmutabilidad Financiera)
customerName String
cedula String  
 customerPhone String

subtotal Decimal @db.Decimal(10, 2) @default(0.00) // Suma calculada de items realmente pickeados
shippingCost Decimal @db.Decimal(10, 2) @default(0.00)
total Decimal @db.Decimal(10, 2)
status OrderStatus @default(PENDING)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relaciones
payment Payment?  
 items OrderItem[]
auditLogs AuditLog[]

// Personal operativo de la sucursal física
pickerId String?
picker User? @relation("PickerOrders", fields: [pickerId], references: [id])
deliveryPersonId String?
deliveryPerson User? @relation("DeliveryOrders", fields: [deliveryPersonId], references: [id])

// 🚀 ÍNDICES SENIOR: Optimización extrema de colas de trabajo y vistas operativas
@@index([customerId])
@@index([status]) // Crítico para que el picker liste rápido las "PENDING" o "PICKING"
@@index([pickerId])
@@index([deliveryPersonId])
@@map("orders")
}

model OrderItem {
id String @id @default(uuid())
orderId String
order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
productId String
product Product @relation(fields: [productId], references: [id])
name String // Nombre histórico del producto
price Decimal @db.Decimal(10, 2) // Precio congelado

// Soporte para peso/fracciones (ej: 1.250 kg de carne)
requestedQuantity Decimal @db.Decimal(10, 3)
pickedQuantity Decimal @db.Decimal(10, 3)
status ItemStatus @default(COMPLETED)

// Flujo del Picker: Producto que sustituye al original si se agota
substitutedWithId String?  
 substitutedWith Product? @relation("SubstitutedWithProduct", fields: [substitutedWithId], references: [id])

// 🚀 ÍNDICES SENIOR: Acelera el cruce de tablas al consultar carritos y órdenes
@@index([orderId])
@@index([productId])
@@map("order_items")
}

// ==========================================
// MÓDULO 4: CONTROL FINANCIERO Y AUDITORÍA
// ==========================================

model Payment {
id String @id @default(uuid())
orderId String @unique
order Order @relation(fields: [orderId], references: [id], onDelete: Restrict)
amount Decimal @db.Decimal(10, 2)
method PaymentMethod  
 status PaymentStatus @default(PENDING)
reference String? // Removido el @unique para evitar colisiones con nulos/v acíos en base de datos.
receiptUrl String? // URL de captura subida por el cliente
reviewedById String? // Operador/Admin que concilió el pago en físico
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// 🚀 ÍNDICES SENIOR: Optimiza la mesa de control de finanzas del administrador
@@index([status])
@@map("payments")
}

model AuditLog {
id String @id @default(uuid())
orderId String?
order Order? @relation(fields: [orderId], references: [id], onDelete: SetNull)
action String // Ej: "PICKER_REDUCED_QUANTITY", "ADMIN_APPROVED_PAYMENT"
performedById String
performedBy User @relation("UserAudited", fields: [performedById], references: [id])
previousState Json? // Snapshot JSON antes del cambio
newState Json? // Snapshot JSON después del cambio
timestamp DateTime @default(now())

// 🚀 ÍNDICES SENIOR: Agiliza las búsquedas de soporte ante reclamos de una orden
@@index([orderId])
@@map("audit_logs")
}
