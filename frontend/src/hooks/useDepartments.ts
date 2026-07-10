import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as departmentsApi from "@/api/departments";

export const departmentsQueryKey = ["departments"] as const;

export function useDepartments() {
  return useQuery({
    queryKey: departmentsQueryKey,
    queryFn: departmentsApi.getAllDepartments,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => departmentsApi.createDepartment(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKey });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) =>
      departmentsApi.updateDepartment(id, nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKey });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKey });
    },
  });
}
