import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import * as machineService from "../services/machineServices";

export const createMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { serviceTag, modelo, IP, numeroSerie, departamento } = req.body;

    const newMachine = await machineService.createMachine({
      serviceTag,
      modelo,
      IP,
      numeroSerie,
      departamento: {
        connect: {
          id: departamento,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: newMachine,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(400).json({
        success: false,
        message: "El serviceTag ya está registrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al crear la máquina",
      error: error.message,
    });
  }
};

export const getAllMachines = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const machines = await machineService.getAllMachines();

    res.status(200).json({
      success: true,
      data: machines,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener las máquinas",
      error: error.message,
    });
  }
};

export const getMachineById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const machine = await machineService.getMachineById(id);

    if (!machine) {
      res.status(404).json({
        success: false,
        message: "Máquina no encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: machine,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener la máquina",
      error: error.message,
    });
  }
};

export const updateMachine = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { serviceTag, modelo, IP, numeroSerie, departamento } = req.body;

    const existingMachine = await machineService.getMachineById(id);

    if (!existingMachine) {
      res.status(404).json({
        success: false,
        message: "Máquina no encontrada",
      });
      return;
    }

    const updateData: Prisma.MaquinaUpdateInput = {
      serviceTag,
      modelo,
      IP,
      numeroSerie,
      ...(departamento && {
        departamento: {
          connect: {
            id: departamento,
          },
        },
      }),
    };

    const updatedMachine = await machineService.updateMachine(id, updateData);

    res.status(200).json({
      success: true,
      message: "Máquina actualizada correctamente",
      data: updatedMachine,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(400).json({
        success: false,
        message: "El serviceTag ya está registrado",
      });
      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Máquina no encontrada",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar la máquina",
      error: error.message,
    });
  }
};

export const deleteMachine = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existingMachine = await machineService.getMachineById(id);

    if (!existingMachine) {
      res.status(404).json({
        success: false,
        message: "Máquina no encontrada",
      });
      return;
    }

    const deletedMachine = await machineService.deleteMachine(id);

    res.status(200).json({
      success: true,
      message: "Máquina eliminada correctamente",
      data: deletedMachine,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Máquina no encontrada",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al eliminar la máquina",
      error: error.message,
    });
  }
};