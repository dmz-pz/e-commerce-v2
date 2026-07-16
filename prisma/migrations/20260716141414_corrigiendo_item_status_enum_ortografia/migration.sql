/*
  Warnings:

  - The values [CANCELED] on the enum `ItemStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemStatus_new" AS ENUM ('COMPLETED', 'PARTIAL', 'SUBSTITUTED', 'CANCELLED');
ALTER TABLE "public"."order_items" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "order_items" ALTER COLUMN "status" TYPE "ItemStatus_new" USING ("status"::text::"ItemStatus_new");
ALTER TYPE "ItemStatus" RENAME TO "ItemStatus_old";
ALTER TYPE "ItemStatus_new" RENAME TO "ItemStatus";
DROP TYPE "public"."ItemStatus_old";
ALTER TABLE "order_items" ALTER COLUMN "status" SET DEFAULT 'COMPLETED';
COMMIT;
