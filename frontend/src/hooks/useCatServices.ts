import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as catServicesApi from "@/api/catservices";
import type { TipoServicio } from "@/types";

export const catServicesQueryKey = ["catservices"] as const;

export function useCatServices() {
  return useQuery({
    queryKey: catServicesQueryKey,
    queryFn: catServicesApi.getAllCatServices,
  });
}

export function useCreateCatService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nombre, tipo }: { nombre: string; tipo: TipoServicio }) =>
      catServicesApi.createCatService(nombre, tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catServicesQueryKey });
    },
  });
}

export function useUpdateCatService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nombre, tipo }: { id: string; nombre: string; tipo: TipoServicio }) =>
      catServicesApi.updateCatService(id, nombre, tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catServicesQueryKey });
    },
  });
}

export function useDeleteCatService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catServicesApi.deleteCatService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catServicesQueryKey });
    },
  });
}
