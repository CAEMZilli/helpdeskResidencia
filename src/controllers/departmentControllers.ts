import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import * as departmentService from "../services/departmentServices";

export const createDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nombre } = req.body;

    const newDepartment = await departmentService.createDepartment({
      nombre,
    });

    res.status(201).json({
      success: true,
      data: newDepartment,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error al crear el departamento",
      error: error.message,
    });
  }
};