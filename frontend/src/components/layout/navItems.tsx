import { Building2, History, LayoutDashboard, ListChecks, Monitor, PlusCircle, Settings, Tags, Users } from "lucide-react";
import type { NavItem } from "@/components/layout/AppShell";

export const usuarioNavItems: NavItem[] = [
  { to: "/usuario/nuevo-ticket", label: "Nuevo ticket", icon: PlusCircle },
  { to: "/usuario/mis-tickets", label: "Mis tickets", icon: ListChecks },
  { to: "/usuario/configuracion", label: "Configuración", icon: Settings },
];

export const tecnicoNavItems: NavItem[] = [
  { to: "/tecnico", label: "Cola de tickets", icon: ListChecks },
  { to: "/tecnico/historial", label: "Historial", icon: History },
  { to: "/tecnico/configuracion", label: "Configuración", icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { to: "/admin/departamentos", label: "Departamentos", icon: Building2 },
  { to: "/admin/maquinas", label: "Máquinas", icon: Monitor },
  { to: "/admin/catalogo", label: "Catálogo de servicios", icon: Tags },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings },
];
