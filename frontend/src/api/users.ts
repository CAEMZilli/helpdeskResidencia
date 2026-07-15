import { apiClient } from "@/api/client";
import type { ApiResponse, Usuario } from "@/types";

// El backend incluye el hash de password en las respuestas de /api/user.
// Lo descartamos aquí para que nunca llegue a un componente de UI.
type UsuarioRaw = Usuario & { password?: string };

function stripPassword(u: UsuarioRaw): Usuario {
  const { password: _password, ...rest } = u;
  return rest;
}

export interface CreateUserInput {
  nombre: string;
  apellido: string;
  rol: string;
  email: string;
  telefono: string;
  password: string;
  departamento: string;
}

export interface UpdateUserInput {
  nombre?: string;
  apellido?: string;
  rol?: string;
  email?: string;
  telefono?: string;
  password?: string;
  activo?: boolean;
  departamento?: string;
  correoSecundario?: string | null;
}

export async function getAllUsers(): Promise<Usuario[]> {
  const res = await apiClient.get<ApiResponse<UsuarioRaw[]>>("/api/user");
  return (res.data.data ?? []).map(stripPassword);
}

export async function getUserById(id: string): Promise<Usuario> {
  const res = await apiClient.get<ApiResponse<UsuarioRaw>>(`/api/user/${id}`);
  return stripPassword(res.data.data as UsuarioRaw);
}

export async function createUser(input: CreateUserInput): Promise<Usuario> {
  const res = await apiClient.post<ApiResponse<UsuarioRaw>>("/api/user", input);
  return stripPassword(res.data.data as UsuarioRaw);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<Usuario> {
  const res = await apiClient.put<ApiResponse<UsuarioRaw>>(`/api/user/${id}`, input);
  return stripPassword(res.data.data as UsuarioRaw);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/api/user/${id}`);
}
