-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('ABIERTO', 'EN_PROGRESO', 'ATENDIDO', 'CERRADO');

-- CreateEnum
CREATE TYPE "Servicios" AS ENUM ('SERVICIO', 'TELEFONIA', 'HARDWARE', 'SOFTWARE', 'RED', 'IMPRESION');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "departamentoId" UUID NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" UUID NOT NULL,
    "creadoPorId" UUID NOT NULL,
    "asignadoAId" UUID NOT NULL,
    "asunto" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EstadoTicket" NOT NULL DEFAULT 'ABIERTO',
    "descripcion" TEXT NOT NULL,
    "servicioId" UUID NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatServicios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "Servicios" NOT NULL,

    CONSTRAINT "CatServicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maquina" (
    "id" UUID NOT NULL,
    "serviceTag" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "IP" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "departamentoId" UUID NOT NULL,

    CONSTRAINT "Maquina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departamento" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefono_key" ON "Usuario"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Maquina_serviceTag_key" ON "Maquina"("serviceTag");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "CatServicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maquina" ADD CONSTRAINT "Maquina_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
