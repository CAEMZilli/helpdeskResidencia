import {prisma}from"../config/db"
import type { Usuario,Prisma } from "../generated/prisma/client"

export const createUser = async (data: Prisma.UsuarioCreateInput):Promise<Usuario>=>{
    const newUser = await prisma.usuario.create({data});
    return newUser;
}

export const getAllUsers = async (): Promise<Usuario[]> => {
  const users = await prisma.usuario.findMany({
    include: {
      departamento: true,
    },
  });

  return users;
};

export const getUserById = async (id: string): Promise<Usuario | null> => {
  const user = await prisma.usuario.findUnique({
    where: { id },
    include: {
      departamento: true,
    },
  });

  return user;
};

export const updateUser = async (
  id: string,
  data: Prisma.UsuarioUpdateInput
): Promise<Usuario> => {
  const updatedUser = await prisma.usuario.update({
    where: { id },
    data,
  });

  return updatedUser;
};

export const deleteUser = async (id: string): Promise<Usuario> => {
  const deletedUser = await prisma.usuario.delete({
    where: { id },
  });

  return deletedUser;
};

