import type { Request, Response } from "express";
import { Prisma, EstadoTicket } from "../generated/prisma/client";
import * as ticketService from "../services/ticketServices";

export const createTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      creadoPor,
      asignadoA,
      asunto,
      descripcion,
      status,
      servicio,
    } = req.body;

    const newTicket = await ticketService.createTicket({
      asunto,
      descripcion,
      ...(status && { status: status as EstadoTicket }),
      creadoPor: {
        connect: {
          id: creadoPor,
        },
      },
      ...(asignadoA && {
        asignadoA: {
          connect: {
            id: asignadoA,
          },
        },
      }),
      servicio: {
        connect: {
          id: servicio,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: newTicket,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al crear el ticket",
      error: error.message,
    });
  }
};

export const getAllTickets = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const tickets = await ticketService.getAllTickets();

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener los tickets",
      error: error.message,
    });
  }
};

export const getTicketById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const ticket = await ticketService.getTicketById(id);

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener el ticket",
      error: error.message,
    });
  }
};

export const updateTicket = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      creadoPor,
      asignadoA,
      asunto,
      descripcion,
      status,
      servicio,
    } = req.body;

    const existingTicket = await ticketService.getTicketById(id);

    if (!existingTicket) {
      res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
      return;
    }

    const updateData: Prisma.TicketUpdateInput = {
      asunto,
      descripcion,
      ...(status && { status: status as EstadoTicket }),
      ...(creadoPor && {
        creadoPor: {
          connect: {
            id: creadoPor,
          },
        },
      }),
      ...(asignadoA && {
        asignadoA: {
          connect: {
            id: asignadoA,
          },
        },
      }),
      ...(servicio && {
        servicio: {
          connect: {
            id: servicio,
          },
        },
      }),
    };

    const updatedTicket = await ticketService.updateTicket(id, updateData);

    res.status(200).json({
      success: true,
      message: "Ticket actualizado correctamente",
      data: updatedTicket,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar el ticket",
      error: error.message,
    });
  }
};

export const deleteTicket = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existingTicket = await ticketService.getTicketById(id);

    if (!existingTicket) {
      res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
      return;
    }

    const deletedTicket = await ticketService.deleteTicket(id);

    res.status(200).json({
      success: true,
      message: "Ticket eliminado correctamente",
      data: deletedTicket,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al eliminar el ticket",
      error: error.message,
    });
  }
};