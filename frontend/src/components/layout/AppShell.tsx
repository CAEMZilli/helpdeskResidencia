import { NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { roleLabel } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoBienestar from "@/assets/logo-bienestar.png";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AppShellProps {
  subtitle: string;
  navItems: NavItem[];
}

function saludoPorHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function AppShell({ subtitle, navItems }: AppShellProps) {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-svh grid grid-cols-1 md:grid-cols-[250px_1fr]">
      <aside className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="px-4 py-4 border-b border-sidebar-border flex flex-col items-center gap-1.5">
          <div className="w-full rounded-md bg-white px-3 py-2 flex items-center justify-center">
            <img src={logoBienestar} alt="Secretaría de Bienestar" className="h-8 w-auto" />
          </div>
          <p className="text-[11px] font-medium text-sidebar-foreground/70 leading-tight text-center">
            CATI · Centro de Atención Técnica Informática
          </p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
              end
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="mb-2 px-1">
            <p className="text-sm font-medium truncate">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-sidebar-foreground/60">{user ? roleLabel(user.rol) : ""}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="size-3.5" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <div className="flex flex-col min-w-0">
        <header className="bg-card px-6 py-3 border-b-2 border-accent">
          <h1 className="text-lg font-semibold leading-tight">
            {saludoPorHora()}
            {user?.nombre ? `, ${user.nombre}` : ""}
          </h1>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </header>
        <main className="flex-1 p-6 overflow-auto bg-secondary/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
