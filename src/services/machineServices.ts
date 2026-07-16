import { prisma } from "../config/db";
import type { Maquina, Prisma } from "@prisma/client";

type MachineWithDepartment = Prisma.MaquinaGetPayload<{
  include: { departamento: true };
}>;

export const createMachine = async (
  data: Prisma.MaquinaCreateInput
): Promise<Maquina> => {
  const newMachine = await prisma.maquina.create({ data });
  return newMachine;
};

export const getAllMachines = async (): Promise<MachineWithDepartment[]> => {
  const machines = await prisma.maquina.findMany({
    include: {
      departamento: true,
    },
  });

  return machines;
};

export const getMachineById = async (
  id: string
): Promise<MachineWithDepartment | null> => {
  const machine = await prisma.maquina.findUnique({
    where: { id },
    include: {
      departamento: true,
    },
  });

  return machine;
};

export const updateMachine = async (
  id: string,
  data: Prisma.MaquinaUpdateInput
): Promise<Maquina> => {
  const updatedMachine = await prisma.maquina.update({
    where: { id },
    data,
  });

  return updatedMachine;
};

export const deleteMachine = async (id: string): Promise<Maquina> => {
  const deletedMachine = await prisma.maquina.delete({
    where: { id },
  });

  return deletedMachine;
};