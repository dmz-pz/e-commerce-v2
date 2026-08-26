/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "exchange_rate" DECIMAL(10,4) NOT NULL DEFAULT 0.00,
ADD COLUMN     "total_bs" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
