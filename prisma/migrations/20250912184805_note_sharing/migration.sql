/*
  Warnings:

  - A unique constraint covering the columns `[publicShareId]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN "publicShareId" TEXT;
ALTER TABLE "Note" ADD COLUMN "sharedWith" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Note_publicShareId_key" ON "Note"("publicShareId");
