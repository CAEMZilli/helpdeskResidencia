import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import * as userService from "../services/userServices";
import bcrypt from "bcryptjs";
import { isNonEmptyString, isValidEmail, sanitizeString } from "../utils/validators";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, rol, email, telefono, password, departamento } = req.body;

    if (
      !isNonEmptyString(nombre) ||
      !isNonEmptyString(apellido) ||
      !isNonEmptyString(rol) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(telefono) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(departamento)
    ) {
      res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos y deben ser válidos.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: "El correo electrónico tiene un formato inválido.",
      });
      return;
    }

    const cleanNombre = sanitizeString(nombre);
    const cleanApellido = sanitizeString(apellido);
    const cleanRol = sanitizeString(rol);
    const cleanEmail = email.trim().toLowerCase();
    const cleanTelefono = sanitizeString(telefono);
    const cleanDepartamento = sanitizeString(departamento);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userService.createUser({
      nombre: cleanNombre,
      apellido: cleanApellido,
      rol: cleanRol,
      email: cleanEmail,
      telefono: cleanTelefono,
      password: hashedPassword,
      departamento: {
        connect: {
          id: cleanDepartamento,
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
    const { nombre, apellido, rol, email, telefono, password, activo, departamento, correoSecundario } =
      req.body;

    const existingUser = await userService.getUserById(id);

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    if (email !== undefined && !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: "El correo electrónico tiene un formato inválido.",
      });
      return;
    }

    if (nombre !== undefined && !isNonEmptyString(nombre)) {
      res.status(400).json({ success: false, message: "El nombre no puede estar vacío." });
      return;
    }
    if (apellido !== undefined && !isNonEmptyString(apellido)) {
      res.status(400).json({ success: false, message: "El apellido no puede estar vacío." });
      return;
    }
    if (rol !== undefined && !isNonEmptyString(rol)) {
      res.status(400).json({ success: false, message: "El rol no puede estar vacío." });
      return;
    }
    if (telefono !== undefined && !isNonEmptyString(telefono)) {
      res.status(400).json({ success: false, message: "El teléfono no puede estar vacío." });
      return;
    }
    if (password !== undefined && !isNonEmptyString(password)) {
      res.status(400).json({ success: false, message: "La contraseña no puede estar vacía." });
      return;
    }
    if (departamento !== undefined && !isNonEmptyString(departamento)) {
      res.status(400).json({ success: false, message: "El departamento no puede estar vacío." });
      return;
    }
    // correoSecundario es opcional: null/"" lo limpia, un valor debe ser email válido.
    if (
      correoSecundario !== undefined &&
      correoSecundario !== null &&
      correoSecundario !== "" &&
      !isValidEmail(correoSecundario)
    ) {
      res.status(400).json({
        success: false,
        message: "El correo secundario tiene un formato inválido.",
      });
      return;
    }

    const cleanNombre = nombre !== undefined ? sanitizeString(nombre) : undefined;
    const cleanApellido = apellido !== undefined ? sanitizeString(apellido) : undefined;
    const cleanRol = rol !== undefined ? sanitizeString(rol) : undefined;
    const cleanEmail = email !== undefined ? email.trim().toLowerCase() : undefined;
    const cleanTelefono = telefono !== undefined ? sanitizeString(telefono) : undefined;
    const cleanDepartamento = departamento !== undefined ? sanitizeString(departamento) : undefined;
    const cleanCorreoSecundario =
      correoSecundario === undefined
        ? undefined
        : correoSecundario === null || correoSecundario === ""
          ? null
          : correoSecundario.trim().toLowerCase();

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const updateData: Prisma.UsuarioUpdateInput = {
      ...(cleanNombre !== undefined && { nombre: cleanNombre }),
      ...(cleanApellido !== undefined && { apellido: cleanApellido }),
      ...(cleanRol !== undefined && { rol: cleanRol }),
      ...(cleanEmail !== undefined && { email: cleanEmail }),
      ...(cleanTelefono !== undefined && { telefono: cleanTelefono }),
      ...(cleanCorreoSecundario !== undefined && { correoSecundario: cleanCorreoSecundario }),
      ...(hashedPassword && { password: hashedPassword }),
      ...(activo !== undefined && { activo }),
      ...(cleanDepartamento && {
        departamento: {
          connect: {
            id: cleanDepartamento,
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
      error.code === "P2003"
    ) {
      res.status(400).json({
        success: false,
        message: "No se puede eliminar el usuario porque tiene tickets asociados.",
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
      message: "Error al eliminar el usuario",
      error: error.message,
    });
  }
};