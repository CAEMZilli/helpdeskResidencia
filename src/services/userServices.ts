import {prisma}from"../config/db"
import type { Usuario,Prisma } from "../generated/prisma/client"

export const createUser = async (data: Prisma.UsuarioCreateInput):Promise<Usuario>=>{
    const newUser = await prisma.usuario.create({data});
    return newUser;
}

