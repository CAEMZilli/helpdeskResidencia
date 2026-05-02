import type { Request, Response } from "express";
import { Prisma, Servicios } from "../generated/prisma/client";
import * as catServiceService from "../services/catServicesServices";

export const createCatService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nombre, tipo } = req.body;

    const newCatService = await catServiceService.createCatService({
      nombre,
      tipo: tipo as Servicios,
    });

    res.status(201).json({
      success: true,
      data: newCatService,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al crear el catálogo de servicio",
      error: error.message,
    });
  }
};

export const getAllCatServices = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const services = await catServiceService.getAllCatServices();

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener los catálogos de servicio",
      error: error.message,
    });
  }
};

export const getCatServiceById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await catServiceService.getCatServiceById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Catálogo de servicio no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener el catálogo de servicio",
      error: error.message,
    });
  }
};

export const updateCatService = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, tipo } = req.body;

    const existingService = await catServiceService.getCatServiceById(id);

    if (!existingService) {
      res.status(404).json({
        success: false,
        message: "Catálogo de servicio no encontrado",
      });
      return;
    }

    const updateData: Prisma.CatServiciosUpdateInput = {
      nombre,
      ...(tipo && { tipo: tipo as Servicios }),
    };

    const updatedService = await catServiceService.updateCatService(
      id,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Catálogo de servicio actualizado correctamente",
      data: updatedService,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Catálogo de servicio no encontrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar el catálogo de servicio",
      error: error.message,
    });
  }
};

export const deleteCatService = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existingService = await catServiceService.getCatServiceById(id);

    if (!existingService) {
      res.status(404).json({
        success: false,
        message: "Catálogo de servicio no encontrado",
      });
      return;
    }

    const deletedService = await catServiceService.deleteCatService(id);

    res.status(200).json({
      success: true,
      message: "Catálogo de servicio eliminado correctamente",
      data: deletedService,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Catálogo de servicio no encontrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al eliminar el catálogo de servicio",
      error: error.message,
    });
  }
};