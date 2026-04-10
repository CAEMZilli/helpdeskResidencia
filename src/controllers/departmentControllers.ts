import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import * as departmentService from "../services/departmentServices";

type DepartmentParams = {
  id: string;
};

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

export const deleteDepartment = async (
  req: Request<DepartmentParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedDepartment = await departmentService.deleteDepartment(id);

    res.status(200).json({
      success: true,
      message: "Departamento eliminado correctamente",
      data: deletedDepartment,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Departamento no encontrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al eliminar el departamento",
      error: error.message,
    });
  }
};

export const findDepartmentById = async (
  req: Request<DepartmentParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const department = await departmentService.findDepartmentById(id);

    if (!department) {
      res.status(404).json({
        success: false,
        message: "Departamento no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error al buscar el departamento",
      error: error.message,
    });
  }
};

export const findAllDepartments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const departments = await departmentService.findAllDepartments();

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los departamentos",
      error: error.message,
    });
  }
};

export const updateDepartment = async (
  req: Request<DepartmentParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const updatedDepartment = await departmentService.updateDepartment(id, {
      nombre,
    });

    res.status(200).json({
      success: true,
      message: "Departamento actualizado correctamente",
      data: updatedDepartment,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Departamento no encontrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar el departamento",
      error: error.message,
    });
  }
};