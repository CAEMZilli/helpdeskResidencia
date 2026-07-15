import type { Request, Response } from "express";
import { Prisma, EstadoTicket } from "@prisma/client";
import * as ticketService from "../services/ticketServices";
import { isNonEmptyString, sanitizeString } from "../utils/validators";

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
      maquina,
    } = req.body;

    if (
      !isNonEmptyString(creadoPor) ||
      !isNonEmptyString(asunto) ||
      !isNonEmptyString(descripcion) ||
      !isNonEmptyString(servicio)
    ) {
      res.status(400).json({
        success: false,
        message: "Los campos creadoPor, asunto, descripcion y servicio son obligatorios y deben ser válidos.",
      });
      return;
    }

    if (status !== undefined && !Object.values(EstadoTicket).includes(status as any)) {
      res.status(400).json({
        success: false,
        message: "El estado proporcionado para el ticket no es válido.",
      });
      return;
    }

    const cleanAsunto = sanitizeString(asunto);
    const cleanDescripcion = sanitizeString(descripcion);
    const cleanCreadoPor = sanitizeString(creadoPor);
    const cleanServicio = sanitizeString(servicio);
    const cleanAsignadoA = asignadoA ? sanitizeString(asignadoA) : undefined;
    const cleanMaquina = maquina ? sanitizeString(maquina) : undefined;

    const newTicket = await ticketService.createTicket({
      asunto: cleanAsunto,
      descripcion: cleanDescripcion,
      ...(status && { status: status as EstadoTicket }),
      creadoPor: {
        connect: {
          id: cleanCreadoPor,
        },
      },
      ...(cleanAsignadoA && {
        asignadoA: {
          connect: {
            id: cleanAsignadoA,
          },
        },
      }),
      servicio: {
        connect: {
          id: cleanServicio,
        },
      },
      ...(cleanMaquina && {
        maquina: {
          connect: {
            id: cleanMaquina,
          },
        },
      }),
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
      maquina,
      notaCierre,
    } = req.body;

    const existingTicket = await ticketService.getTicketById(id);

    if (!existingTicket) {
      res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
      return;
    }

    if (asunto !== undefined && !isNonEmptyString(asunto)) {
      res.status(400).json({ success: false, message: "El asunto no puede estar vacío." });
      return;
    }
    if (descripcion !== undefined && !isNonEmptyString(descripcion)) {
      res.status(400).json({ success: false, message: "La descripción no puede estar vacía." });
      return;
    }
    if (creadoPor !== undefined && !isNonEmptyString(creadoPor)) {
      res.status(400).json({ success: false, message: "El creador (creadoPor) no puede estar vacío." });
      return;
    }
    if (servicio !== undefined && !isNonEmptyString(servicio)) {
      res.status(400).json({ success: false, message: "El servicio no puede estar vacío." });
      return;
    }

    if (status !== undefined && !Object.values(EstadoTicket).includes(status as any)) {
      res.status(400).json({
        success: false,
        message: "El estado proporcionado para el ticket no es válido.",
      });
      return;
    }

    // Al cerrar un ticket (transición hacia CERRADO) es obligatorio un reporte de cierre.
    if (status === "CERRADO" && existingTicket.status !== "CERRADO" && !isNonEmptyString(notaCierre)) {
      res.status(400).json({
        success: false,
        message: "Debes escribir un reporte de cierre para poder cerrar el ticket.",
      });
      return;
    }

    const cleanAsunto = asunto !== undefined ? sanitizeString(asunto) : undefined;
    const cleanDescripcion = descripcion !== undefined ? sanitizeString(descripcion) : undefined;
    const cleanCreadoPor = creadoPor !== undefined ? sanitizeString(creadoPor) : undefined;
    const cleanServicio = servicio !== undefined ? sanitizeString(servicio) : undefined;
    const cleanNotaCierre = isNonEmptyString(notaCierre) ? sanitizeString(notaCierre) : undefined;

    // Desasignación: si viene asignadoA como null o "", desconectamos. Si viene un ID válido, conectamos.
    let asignadoAUpdate: Prisma.UsuarioUpdateOneWithoutTicketsAsignadosNestedInput | undefined;
    if (asignadoA === null || asignadoA === "") {
      asignadoAUpdate = { disconnect: true };
    } else if (isNonEmptyString(asignadoA)) {
      asignadoAUpdate = { connect: { id: sanitizeString(asignadoA) } };
    }

    // Misma semántica que asignadoA: null/"" desconecta la máquina, un ID válido la (re)conecta.
    let maquinaUpdate: Prisma.MaquinaUpdateOneWithoutTicketsNestedInput | undefined;
    if (maquina === null || maquina === "") {
      maquinaUpdate = { disconnect: true };
    } else if (isNonEmptyString(maquina)) {
      maquinaUpdate = { connect: { id: sanitizeString(maquina) } };
    }

    // fechaCierre se gestiona automáticamente a partir del cambio de status:
    // se marca al cerrar, y se limpia si el ticket se reabre.
    let fechaCierreUpdate: Date | null | undefined;
    if (status === "CERRADO" && existingTicket.status !== "CERRADO") {
      fechaCierreUpdate = new Date();
    } else if (status && status !== "CERRADO" && existingTicket.status === "CERRADO") {
      fechaCierreUpdate = null;
    }

    const updateData: Prisma.TicketUpdateInput = {
      ...(cleanAsunto !== undefined && { asunto: cleanAsunto }),
      ...(cleanDescripcion !== undefined && { descripcion: cleanDescripcion }),
      ...(status && { status: status as EstadoTicket }),
      ...(fechaCierreUpdate !== undefined && { fechaCierre: fechaCierreUpdate }),
      ...(cleanNotaCierre !== undefined && { notaCierre: cleanNotaCierre }),
      ...(cleanCreadoPor && {
        creadoPor: {
          connect: {
            id: cleanCreadoPor,
          },
        },
      }),
      ...(asignadoAUpdate && { asignadoA: asignadoAUpdate }),
      ...(cleanServicio && {
        servicio: {
          connect: {
            id: cleanServicio,
          },
        },
      }),
      ...(maquinaUpdate && { maquina: maquinaUpdate }),
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