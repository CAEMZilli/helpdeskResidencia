import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import * as machineService from "../services/machineServices";
import { isNonEmptyString, sanitizeString } from "../utils/validators";

export const createMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { serviceTag, modelo, IP, numeroSerie, departamento } = req.body;

    if (
      !isNonEmptyString(serviceTag) ||
      !isNonEmptyString(modelo) ||
      !isNonEmptyString(IP) ||
      !isNonEmptyString(numeroSerie) ||
      !isNonEmptyString(departamento)
    ) {
      res.status(400).json({
        success: false,
        message: "Todos los campos (serviceTag, modelo, IP, numeroSerie, departamento) son requeridos y deben ser válidos.",
      });
      return;
    }

    const cleanServiceTag = sanitizeString(serviceTag);
    const cleanModelo = sanitizeString(modelo);
    const cleanIP = sanitizeString(IP);
    const cleanNumeroSerie = sanitizeString(numeroSerie);
    const cleanDepartamento = sanitizeString(departamento);

    const newMachine = await machineService.createMachine({
      serviceTag: cleanServiceTag,
      modelo: cleanModelo,
      IP: cleanIP,
      numeroSerie: cleanNumeroSerie,
      departamento: {
        connect: {
          id: cleanDepartamento,
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

    if (serviceTag !== undefined && !isNonEmptyString(serviceTag)) {
      res.status(400).json({ success: false, message: "El serviceTag no puede estar vacío." });
      return;
    }
    if (modelo !== undefined && !isNonEmptyString(modelo)) {
      res.status(400).json({ success: false, message: "El modelo no puede estar vacío." });
      return;
    }
    if (IP !== undefined && !isNonEmptyString(IP)) {
      res.status(400).json({ success: false, message: "La dirección IP no puede estar vacía." });
      return;
    }
    if (numeroSerie !== undefined && !isNonEmptyString(numeroSerie)) {
      res.status(400).json({ success: false, message: "El número de serie no puede estar vacío." });
      return;
    }
    if (departamento !== undefined && !isNonEmptyString(departamento)) {
      res.status(400).json({ success: false, message: "El departamento no puede estar vacío." });
      return;
    }

    const cleanServiceTag = serviceTag !== undefined ? sanitizeString(serviceTag) : undefined;
    const cleanModelo = modelo !== undefined ? sanitizeString(modelo) : undefined;
    const cleanIP = IP !== undefined ? sanitizeString(IP) : undefined;
    const cleanNumeroSerie = numeroSerie !== undefined ? sanitizeString(numeroSerie) : undefined;
    const cleanDepartamento = departamento !== undefined ? sanitizeString(departamento) : undefined;

    const updateData: Prisma.MaquinaUpdateInput = {
      ...(cleanServiceTag !== undefined && { serviceTag: cleanServiceTag }),
      ...(cleanModelo !== undefined && { modelo: cleanModelo }),
      ...(cleanIP !== undefined && { IP: cleanIP }),
      ...(cleanNumeroSerie !== undefined && { numeroSerie: cleanNumeroSerie }),
      ...(cleanDepartamento && {
        departamento: {
          connect: {
            id: cleanDepartamento,
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