import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import * as userService from "../services/userServices";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, rol, email, telefono, password, departamento } = req.body;

    const newUser = await userService.createUser({
      nombre,
      apellido,
      rol,
      email,
      telefono,
      password,
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
        message: "El correo o teléfono ya está registrado",
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

export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener el usuario",
      error: error.message,
    });
  }
};

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, apellido, rol, email, telefono, password, activo, departamento } =
      req.body;

    const existingUser = await userService.getUserById(id);

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    const updateData: Prisma.UsuarioUpdateInput = {
      nombre,
      apellido,
      rol,
      email,
      telefono,
      password,
      activo,
      ...(departamento && {
        departamento: {
          connect: {
            id: departamento,
          },
        },
      }),
    };

    const updatedUser = await userService.updateUser(id, updateData);

    res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(400).json({
        success: false,
        message: "El correo o teléfono ya está registrado",
      });
      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existingUser = await userService.getUserById(id);

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    const deletedUser = await userService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: "Usuario eliminado correctamente",
      data: deletedUser,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario",
      error: error.message,
    });
  }
};