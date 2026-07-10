import { apiClient } from "@/api/client";
import type { ApiResponse, CatServicio, TipoServicio } from "@/types";

export async function getAllCatServices(): Promise<CatServicio[]> {
  const res = await apiClient.get<ApiResponse<CatServicio[]>>("/api/catservices");
  return res.data.data ?? [];
}

export async function createCatService(
  nombre: string,
  tipo: TipoServicio
): Promise<CatServicio> {
  const res = await apiClient.post<ApiResponse<CatServicio>>("/api/catservices", {
    nombre,
    tipo,
  });
  return res.data.data as CatServicio;
}

export async function updateCatService(
  id: string,
  nombre: string,
  tipo: TipoServicio
): Promise<CatServicio> {
  const res = await apiClient.put<ApiResponse<CatServicio>>(`/api/catservices/${id}`, {
    nombre,
    tipo,
  });
  return res.data.data as CatServicio;
}

export async function deleteCatService(id: string): Promise<void> {
  await apiClient.delete(`/api/catservices/${id}`);
}
