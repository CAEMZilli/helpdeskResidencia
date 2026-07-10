import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ticketsApi from "@/api/tickets";
import type { CreateTicketInput, UpdateTicketInput } from "@/api/tickets";

export const ticketsQueryKey = ["tickets"] as const;

// Sin soporte de query params ni websockets en el backend: el polling
// (refetchInterval) es lo que le da al técnico la sensación de "tiempo real".
const POLL_INTERVAL_MS = 8000;

export function useTickets(options?: { poll?: boolean }) {
  return useQuery({
    queryKey: ticketsQueryKey,
    queryFn: ticketsApi.getAllTickets,
    refetchInterval: options?.poll ? POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: true,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => ticketsApi.createTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsQueryKey });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTicketInput }) =>
      ticketsApi.updateTicket(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsQueryKey });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketsApi.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsQueryKey });
    },
  });
}
