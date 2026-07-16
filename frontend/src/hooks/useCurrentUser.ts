import { useQuery } from "@tanstack/react-query";
import * as usersApi from "@/api/users";
import { useAuthStore } from "@/store/authStore";

// El login solo devuelve {id, nombre, apellido, email, rol}, sin departamentoId.
// Este hook trae el perfil completo del usuario en sesión cuando se necesita
// ese dato (ej. para filtrar máquinas por su departamento).
export function useCurrentUser() {
  const authUser = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["currentUser", authUser?.id],
    queryFn: () => usersApi.getUserById(authUser!.id),
    enabled: !!authUser?.id,
  });
}
