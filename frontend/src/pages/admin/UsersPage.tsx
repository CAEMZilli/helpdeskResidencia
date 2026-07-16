import { toast } from "sonner";
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/store/authStore";
import { apiErrorMessage } from "@/api/client";
import { RoleSelect } from "@/components/users/RoleSelect";
import { normalizeRol } from "@/constants/roles";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import type { Rol } from "@/types";

export function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleRoleChange = async (id: string, rol: Rol) => {
    try {
      await updateUser.mutateAsync({ id, input: { rol } });
      toast.success("Rol actualizado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo actualizar el rol"));
    }
  };

  const handleActivoChange = async (id: string, activo: boolean) => {
    try {
      await updateUser.mutateAsync({ id, input: { activo } });
      toast.success(activo ? "Usuario activado" : "Usuario desactivado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo actualizar el usuario"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      toast.success("Usuario eliminado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo eliminar el usuario"));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usuarios</CardTitle>
        <UserFormDialog />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.nombre} {u.apellido}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.departamento?.nombre ?? "—"}</TableCell>
                  <TableCell>
                    <RoleSelect
                      value={normalizeRol(u.rol) ?? "USUARIO"}
                      disabled={updateUser.isPending || u.id === currentUser?.id}
                      onChange={(rol) => handleRoleChange(u.id, rol)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={u.activo}
                      disabled={updateUser.isPending || u.id === currentUser?.id}
                      onCheckedChange={(checked) => handleActivoChange(u.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          disabled={u.id === currentUser?.id}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Si el usuario tiene tickets
                            asociados, la eliminación fallará.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(u.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
