/*
  Warnings:

  - You are about to drop the column `FirtsName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `LastName` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "barcode" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "FirtsName",
DROP COLUMN "LastName",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");
