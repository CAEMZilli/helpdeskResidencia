import { apiClient } from "@/api/client";
import type { ApiResponse, Maquina } from "@/types";

export interface MachineInput {
  serviceTag: string;
  modelo: string;
  IP: string;
  numeroSerie: string;
  departamento: string;
}

export async function getAllMachines(): Promise<Maquina[]> {
  const res = await apiClient.get<ApiResponse<Maquina[]>>("/api/machine");
  return res.data.data ?? [];
}

export async function createMachine(input: MachineInput): Promise<Maquina> {
  const res = await apiClient.post<ApiResponse<Maquina>>("/api/machine", input);
  return res.data.data as Maquina;
}

export async function updateMachine(id: string, input: Partial<MachineInput>): Promise<Maquina> {
  const res = await apiClient.put<ApiResponse<Maquina>>(`/api/machine/${id}`, input);
  return res.data.data as Maquina;
}

export async function deleteMachine(id: string): Promise<void> {
  await apiClient.delete(`/api/machine/${id}`);
}
