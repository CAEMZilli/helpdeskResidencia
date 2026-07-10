import { apiClient } from "@/api/client";
import type { ApiResponse, Departamento } from "@/types";

export async function getAllDepartments(): Promise<Departamento[]> {
  const res = await apiClient.get<ApiResponse<Departamento[]>>("/api/department");
  return res.data.data ?? [];
}

export async function createDepartment(nombre: string): Promise<Departamento> {
  const res = await apiClient.post<ApiResponse<Departamento>>("/api/department", { nombre });
  return res.data.data as Departamento;
}

export async function updateDepartment(id: string, nombre: string): Promise<Departamento> {
  const res = await apiClient.put<ApiResponse<Departamento>>(`/api/department/${id}`, {
    nombre,
  });
  return res.data.data as Departamento;
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`/api/department/${id}`);
}
