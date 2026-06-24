import { prisma } from "../config/db";
import type { Ticket, Prisma } from "@prisma/client";

type TicketWithRelations = Prisma.TicketGetPayload<{
  include: {
    creadoPor: true;
    asignadoA: true;
    servicio: true;
  };
}>;

export const createTicket = async (
  data: Prisma.TicketCreateInput
): Promise<Ticket> => {
  const newTicket = await prisma.ticket.create({ data });
  return newTicket;
};

export const getAllTickets = async (): Promise<TicketWithRelations[]> => {
  const tickets = await prisma.ticket.findMany({
    include: {
      creadoPor: true,
      asignadoA: true,
      servicio: true,
    },
  });

  return tickets;
};

export const getTicketById = async (
  id: string
): Promise<TicketWithRelations | null> => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      creadoPor: true,
      asignadoA: true,
      servicio: true,
    },
  });

  return ticket;
};

export const updateTicket = async (
  id: string,
  data: Prisma.TicketUpdateInput
): Promise<Ticket> => {
  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data,
  });

  return updatedTicket;
};

export const deleteTicket = async (id: string): Promise<Ticket> => {
  const deletedTicket = await prisma.ticket.delete({
    where: { id },
  });

  return deletedTicket;
};