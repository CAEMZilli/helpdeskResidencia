import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { homeForRole, normalizeRol } from "@/constants/roles";
import type { Rol } from "@/types";

interface ProtectedRouteProps {
  roles: Rol[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const normalized = normalizeRol(user.rol);
  if (!normalized || !roles.includes(normalized)) {
    return <Navigate to={homeForRole(user.rol)} replace />;
  }

  return <Outlet />;
}
