-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "maquinaId" UUID;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_maquinaId_fkey" FOREIGN KEY ("maquinaId") REFERENCES "Maquina"("id") ON DELETE SET NULL ON UPDATE CASCADE;
