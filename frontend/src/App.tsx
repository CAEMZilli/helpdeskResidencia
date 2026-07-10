import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/store/authStore";
import { homeForRole } from "@/constants/roles";
import { adminNavItems, tecnicoNavItems, usuarioNavItems } from "@/components/layout/navItems";

import { LoginPage } from "@/pages/LoginPage";
import { NewTicketPage } from "@/pages/usuario/NewTicketPage";
import { MyTicketsPage } from "@/pages/usuario/MyTicketsPage";
import { TicketQueuePage } from "@/pages/tecnico/TicketQueuePage";
import { HistoryPage } from "@/pages/tecnico/HistoryPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { DepartmentsPage } from "@/pages/admin/DepartmentsPage";
import { MachinesPage } from "@/pages/admin/MachinesPage";
import { CatServicesPage } from "@/pages/admin/CatServicesPage";

function RootRedirect() {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Navigate to={homeForRole(user.rol)} replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute roles={["USUARIO"]} />}>
          <Route path="/usuario" element={<AppShell title="Portal de Usuario" navItems={usuarioNavItems} />}>
            <Route index element={<Navigate to="nuevo-ticket" replace />} />
            <Route path="nuevo-ticket" element={<NewTicketPage />} />
            <Route path="mis-tickets" element={<MyTicketsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["TECNICO"]} />}>
          <Route path="/tecnico" element={<AppShell title="Panel Técnico" navItems={tecnicoNavItems} />}>
            <Route index element={<TicketQueuePage />} />
            <Route path="historial" element={<HistoryPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["ADMINISTRADOR"]} />}>
          <Route path="/admin" element={<AppShell title="Panel de Administración" navItems={adminNavItems} />}>
            <Route index element={<DashboardPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="departamentos" element={<DepartmentsPage />} />
            <Route path="maquinas" element={<MachinesPage />} />
            <Route path="catalogo" element={<CatServicesPage />} />
          </Route>
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
