/*
  Warnings:

  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_asignadoAId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "asignadoAId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "password" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
