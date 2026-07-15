import { apiClient } from "@/api/client";
import type { ApiResponse, EstadoTicket, Ticket } from "@/types";

export interface CreateTicketInput {
  creadoPor: string;
  asignadoA?: string;
  asunto: string;
  descripcion: string;
  status?: EstadoTicket;
  servicio: string;
  maquina?: string;
}

export interface UpdateTicketInput {
  creadoPor?: string;
  asignadoA?: string | null;
  asunto?: string;
  descripcion?: string;
  status?: EstadoTicket;
  servicio?: string;
  maquina?: string | null;
  notaCierre?: string;
}

export async function getAllTickets(): Promise<Ticket[]> {
  const res = await apiClient.get<ApiResponse<Ticket[]>>("/api/ticket");
  return res.data.data ?? [];
}

export async function getTicketById(id: string): Promise<Ticket> {
  const res = await apiClient.get<ApiResponse<Ticket>>(`/api/ticket/${id}`);
  return res.data.data as Ticket;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const res = await apiClient.post<ApiResponse<Ticket>>("/api/ticket", input);
  return res.data.data as Ticket;
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
  const res = await apiClient.put<ApiResponse<Ticket>>(`/api/ticket/${id}`, input);
  return res.data.data as Ticket;
}

export async function deleteTicket(id: string): Promise<void> {
  await apiClient.delete(`/api/ticket/${id}`);
}
