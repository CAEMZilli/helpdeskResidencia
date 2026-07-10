export const ROLES = ["ADMINISTRADOR", "TECNICO", "USUARIO"] as const;
export type Rol = (typeof ROLES)[number];

export const ESTADOS_TICKET = ["ABIERTO", "EN_PROGRESO", "ATENDIDO", "CERRADO"] as const;
export type EstadoTicket = (typeof ESTADOS_TICKET)[number];

export const TIPOS_SERVICIO = [
  "SERVICIO",
  "TELEFONIA",
  "HARDWARE",
  "SOFTWARE",
  "RED",
  "IMPRESION",
] as const;
export type TipoServicio = (typeof TIPOS_SERVICIO)[number];

export interface Departamento {
  id: string;
  nombre: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  rol: Rol | string;
  email: string;
  telefono: string;
  fechaCreacion: string;
  activo: boolean;
  departamentoId: string;
  departamento?: Departamento;
}

export interface CatServicio {
  id: string;
  nombre: string;
  tipo: TipoServicio;
}

export interface Ticket {
  id: string;
  creadoPorId: string;
  asignadoAId: string | null;
  asunto: string;
  descripcion: string;
  fechaCreacion: string;
  fechaCierre: string | null;
  status: EstadoTicket;
  servicioId: string;
  maquinaId: string | null;
  creadoPor?: Usuario;
  asignadoA?: Usuario | null;
  servicio?: CatServicio;
  maquina?: Maquina | null;
}

export interface Maquina {
  id: string;
  serviceTag: string;
  modelo: string;
  IP: string;
  numeroSerie: string;
  departamentoId: string;
  departamento?: Departamento;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: Rol | string;
  };
  token: string;
}
