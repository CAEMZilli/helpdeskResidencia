import { prisma } from "../config/db"
import type { Departamento, Prisma } from "../generated/prisma/client"

export const createDepartment = async (
  data: Prisma.DepartamentoCreateInput
): Promise<Departamento> => {
  const newDepartment = await prisma.departamento.create({ data });
  return newDepartment;
};

export const deleteDepartment = async (id: string) => {
  return await prisma.departamento.delete({
    where: { id },
  });
};

export const findDepartmentById = async (
  id: string
): Promise<Departamento | null> => {
  const department = await prisma.departamento.findUnique({
    where: { id },
  });

    return department;
};