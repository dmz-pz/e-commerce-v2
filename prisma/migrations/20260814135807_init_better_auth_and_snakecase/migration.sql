/*
  Warnings:

  - You are about to drop the column `userId` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `newState` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `performedById` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `previousState` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `assignedAt` on the `delivery_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `delivery_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPersonId` on the `delivery_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `failureReason` on the `delivery_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `delivery_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `cashInHand` on the `delivery_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `delivery_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `currentLocation` on the `delivery_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `delivery_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `delivery_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `vehiclePlate` on the `delivery_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `driver_settlements` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPersonId` on the `driver_settlements` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedById` on the `driver_settlements` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `driver_settlements` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `exchange_rates` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `pickedQuantity` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `requestedQuantity` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `substitutedWithId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryAddress` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `fulfillmentMethod` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `pickerId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCost` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `receiptUrl` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedById` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `discountPrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isRecommended` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCount` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `salesCount` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `taxRateId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `subcategories` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `delivery_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,category_id]` on the table `subcategories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performed_by_id` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_person_id` to the `delivery_jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `delivery_jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `delivery_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `delivery_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_person_id` to the `driver_settlements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `driver_settlements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `exchange_rates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `picked_quantity` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requested_quantity` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_phone` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategory_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_rate_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `subcategories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_userId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_orderId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_performedById_fkey";

-- DropForeignKey
ALTER TABLE "delivery_jobs" DROP CONSTRAINT "delivery_jobs_deliveryPersonId_fkey";

-- DropForeignKey
ALTER TABLE "delivery_jobs" DROP CONSTRAINT "delivery_jobs_orderId_fkey";

-- DropForeignKey
ALTER TABLE "delivery_profiles" DROP CONSTRAINT "delivery_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "driver_settlements" DROP CONSTRAINT "driver_settlements_deliveryPersonId_fkey";

-- DropForeignKey
ALTER TABLE "driver_settlements" DROP CONSTRAINT "driver_settlements_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_substitutedWithId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customerId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_pickerId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_orderId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_taxRateId_fkey";

-- DropForeignKey
ALTER TABLE "subcategories" DROP CONSTRAINT "subcategories_categoryId_fkey";

-- DropIndex
DROP INDEX "audit_logs_orderId_idx";

-- DropIndex
DROP INDEX "delivery_jobs_deliveryPersonId_idx";

-- DropIndex
DROP INDEX "delivery_jobs_orderId_idx";

-- DropIndex
DROP INDEX "delivery_profiles_userId_key";

-- DropIndex
DROP INDEX "driver_settlements_deliveryPersonId_idx";

-- DropIndex
DROP INDEX "order_items_orderId_idx";

-- DropIndex
DROP INDEX "order_items_productId_idx";

-- DropIndex
DROP INDEX "orders_customerId_idx";

-- DropIndex
DROP INDEX "orders_pickerId_idx";

-- DropIndex
DROP INDEX "payments_orderId_key";

-- DropIndex
DROP INDEX "products_externalId_key";

-- DropIndex
DROP INDEX "products_subcategoryId_idx";

-- DropIndex
DROP INDEX "subcategories_name_categoryId_key";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "newState",
DROP COLUMN "orderId",
DROP COLUMN "performedById",
DROP COLUMN "previousState",
ADD COLUMN     "new_state" JSONB,
ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "performed_by_id" TEXT NOT NULL,
ADD COLUMN     "previous_state" JSONB,
ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "delivery_jobs" DROP COLUMN "assignedAt",
DROP COLUMN "completedAt",
DROP COLUMN "deliveryPersonId",
DROP COLUMN "failureReason",
DROP COLUMN "orderId",
ADD COLUMN     "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "completed_at" TIMESTAMPTZ(3),
ADD COLUMN     "delivery_person_id" TEXT NOT NULL,
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "order_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "delivery_profiles" DROP COLUMN "cashInHand",
DROP COLUMN "createdAt",
DROP COLUMN "currentLocation",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
DROP COLUMN "vehiclePlate",
ADD COLUMN     "cash_in_hand" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_location" JSONB,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "vehicle_plate" TEXT;

-- AlterTable
ALTER TABLE "driver_settlements" DROP COLUMN "createdAt",
DROP COLUMN "deliveryPersonId",
DROP COLUMN "reviewedById",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "delivery_person_id" TEXT NOT NULL,
ADD COLUMN     "reviewed_by_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "exchange_rates" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "orderId",
DROP COLUMN "pickedQuantity",
DROP COLUMN "productId",
DROP COLUMN "requestedQuantity",
DROP COLUMN "substitutedWithId",
ADD COLUMN     "order_id" TEXT NOT NULL,
ADD COLUMN     "picked_quantity" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "product_id" TEXT NOT NULL,
ADD COLUMN     "requested_quantity" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "substituted_with_id" TEXT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "createdAt",
DROP COLUMN "customerId",
DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
DROP COLUMN "deliveryAddress",
DROP COLUMN "fulfillmentMethod",
DROP COLUMN "pickerId",
DROP COLUMN "shippingCost",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customer_id" TEXT NOT NULL,
ADD COLUMN     "customer_name" TEXT NOT NULL,
ADD COLUMN     "customer_phone" TEXT NOT NULL,
ADD COLUMN     "delivery_address" TEXT,
ADD COLUMN     "fulfillment_method" "FulfillmentMethod" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "picker_id" TEXT,
ADD COLUMN     "shipping_cost" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "createdAt",
DROP COLUMN "orderId",
DROP COLUMN "receiptUrl",
DROP COLUMN "reviewedById",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "order_id" TEXT NOT NULL,
ADD COLUMN     "receipt_url" TEXT,
ADD COLUMN     "reviewed_by_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "createdAt",
DROP COLUMN "discountPrice",
DROP COLUMN "externalId",
DROP COLUMN "isActive",
DROP COLUMN "isRecommended",
DROP COLUMN "reviewCount",
DROP COLUMN "salesCount",
DROP COLUMN "subcategoryId",
DROP COLUMN "taxRateId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discount_price" DECIMAL(10,2),
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_recommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sales_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subcategory_id" TEXT NOT NULL,
ADD COLUMN     "tax_rate_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "subcategories" DROP COLUMN "categoryId",
ADD COLUMN     "category_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- DropTable
DROP TABLE "ProductImage";

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(3),
    "refresh_token_expires_at" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumb_url" TEXT,
    "order" INTEGER,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "audit_logs_order_id_idx" ON "audit_logs"("order_id");

-- CreateIndex
CREATE INDEX "delivery_jobs_delivery_person_id_idx" ON "delivery_jobs"("delivery_person_id");

-- CreateIndex
CREATE INDEX "delivery_jobs_order_id_idx" ON "delivery_jobs"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_profiles_user_id_key" ON "delivery_profiles"("user_id");

-- CreateIndex
CREATE INDEX "driver_settlements_delivery_person_id_idx" ON "driver_settlements"("delivery_person_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_picker_id_idx" ON "orders"("picker_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_external_id_key" ON "products"("external_id");

-- CreateIndex
CREATE INDEX "products_subcategory_id_idx" ON "products"("subcategory_id");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_name_category_id_key" ON "subcategories"("name", "category_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tax_rate_id_fkey" FOREIGN KEY ("tax_rate_id") REFERENCES "tax_rates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_picker_id_fkey" FOREIGN KEY ("picker_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_substituted_with_id_fkey" FOREIGN KEY ("substituted_with_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_profiles" ADD CONSTRAINT "delivery_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_jobs" ADD CONSTRAINT "delivery_jobs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_jobs" ADD CONSTRAINT "delivery_jobs_delivery_person_id_fkey" FOREIGN KEY ("delivery_person_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_settlements" ADD CONSTRAINT "driver_settlements_delivery_person_id_fkey" FOREIGN KEY ("delivery_person_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_settlements" ADD CONSTRAINT "driver_settlements_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
