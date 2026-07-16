import type { Request, Response } from "express";
import * as authService from "../services/authServices";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "El correo y la contraseña son requeridos",
      });
      return;
    }

    const authResult = await authService.authenticateUser(email, password);

    if (!authResult) {
      res.status(401).json({
        success: false,
        message: "Correo o contraseña incorrectos",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: authResult,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};
