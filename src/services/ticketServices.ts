import { prisma } from "../config/db";
import type { Ticket, Prisma } from "@prisma/client";

const ticketRelationsInclude = {
  creadoPor: { include: { departamento: true } },
  asignadoA: { include: { departamento: true } },
  servicio: true,
  maquina: true,
} satisfies Prisma.TicketInclude;

type TicketWithRelations = Prisma.TicketGetPayload<{
  include: typeof ticketRelationsInclude;
}>;

export const createTicket = async (
  data: Prisma.TicketCreateInput
): Promise<Ticket> => {
  const newTicket = await prisma.ticket.create({ data });
  return newTicket;
};

export const getAllTickets = async (): Promise<TicketWithRelations[]> => {
  const tickets = await prisma.ticket.findMany({
    include: ticketRelationsInclude,
  });

  return tickets;
};

export const getTicketById = async (
  id: string
): Promise<TicketWithRelations | null> => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: ticketRelationsInclude,
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