import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as machinesApi from "@/api/machines";
import type { MachineInput } from "@/api/machines";

export const machinesQueryKey = ["machines"] as const;

export function useMachines() {
  return useQuery({
    queryKey: machinesQueryKey,
    queryFn: machinesApi.getAllMachines,
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MachineInput) => machinesApi.createMachine(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machinesQueryKey });
    },
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MachineInput> }) =>
      machinesApi.updateMachine(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machinesQueryKey });
    },
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => machinesApi.deleteMachine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: machinesQueryKey });
    },
  });
}
