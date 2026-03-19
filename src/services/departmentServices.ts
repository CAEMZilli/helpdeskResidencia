import { prisma } from "../config/db"
import type { Departamento, Prisma } from "../generated/prisma/client"


export const findDepartment = async (id: string): Promise<Departamento> => {
    const department = await prisma.departamento.findUnique({
        where: { id: id },
    });
    return department! 

}