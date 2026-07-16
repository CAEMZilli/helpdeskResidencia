import { ROLES } from "@/types";
import type { EstadoTicket, Rol, TipoServicio } from "@/types";

export const ROLE_LABELS: Record<Rol, string> = {
  ADMINISTRADOR: "Administrador",
  TECNICO: "Técnico",
  USUARIO: "Usuario",
};

export const ROLE_HOME: Record<Rol, string> = {
  ADMINISTRADOR: "/admin",
  TECNICO: "/tecnico",
  USUARIO: "/usuario",
};

// El backend guarda `rol` como string libre (no enum) y hemos visto datos
// existentes con capitalización inconsistente (ej. "Tecnico" en vez de
// "TECNICO"). Normalizamos a mayúsculas antes de comparar para no depender
// de que el dato llegue exactamente como se espera.
export function normalizeRol(rol: string | null | undefined): Rol | null {
  if (!rol) return null;
  const upper = rol.trim().toUpperCase();
  return (ROLES as readonly string[]).includes(upper) ? (upper as Rol) : null;
}

export function homeForRole(rol: string): string {
  const normalized = normalizeRol(rol);
  return normalized ? ROLE_HOME[normalized] : "/usuario";
}

export function roleLabel(rol: string): string {
  const normalized = normalizeRol(rol);
  return normalized ? ROLE_LABELS[normalized] : rol;
}

export const ESTADO_LABELS: Record<EstadoTicket, string> = {
  ABIERTO: "Abierto",
  EN_PROGRESO: "En progreso",
  ATENDIDO: "Atendido",
  CERRADO: "Cerrado",
};

// Colores ligados a la paleta institucional (dorado = nuevo/en curso, verde medio = resuelto, beige = cerrado).
export const ESTADO_BADGE_VARIANT: Record<EstadoTicket, string> = {
  ABIERTO: "bg-[#F7EFE0] text-[#8A5A1F] border-[#BC955C]/50",
  EN_PROGRESO: "bg-[#FBEFDD] text-[#7A4A12] border-[#A57F2C]/50",
  ATENDIDO: "bg-[#E3F1EC] text-[#00493D] border-[#006657]/40",
  CERRADO: "bg-[#F1EEE7] text-[#5B5648] border-[#DDC9A3]/60",
};

export const ESTADO_FLOW: Record<EstadoTicket, EstadoTicket | null> = {
  ABIERTO: "EN_PROGRESO",
  EN_PROGRESO: "ATENDIDO",
  ATENDIDO: "CERRADO",
  CERRADO: null,
};

export const TIPO_SERVICIO_LABELS: Record<TipoServicio, string> = {
  SERVICIO: "Servicio",
  TELEFONIA: "Telefonía",
  HARDWARE: "Hardware",
  SOFTWARE: "Software",
  RED: "Red",
  IMPRESION: "Impresión",
};
