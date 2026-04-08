import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import * as userService from "../services/userServices";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, rol, email, telefono, departamento } = req.body;

    const newUser = await userService.createUser({
      nombre,
      apellido,
      rol,
      email,
      telefono,
      departamento: {
        connect: {
          id: departamento,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(400).json({
        success: false,
        message: "El correo ya está registrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el usuario",
      error: error.message,
    });
  }
};