import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/hooks/useDepartments";
import { apiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Trash2 } from "lucide-react";
import type { Departamento } from "@/types";

function DepartmentRow({ department }: { department: Departamento }) {
  const [value, setValue] = useState(department.nombre);
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const save = async () => {
    if (value.trim() === department.nombre || !value.trim()) return;
    try {
      await updateDepartment.mutateAsync({ id: department.id, nombre: value.trim() });
      toast.success("Departamento actualizado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo actualizar"));
      setValue(department.nombre);
    }
  };

  const remove = async () => {
    try {
      await deleteDepartment.mutateAsync(department.id);
      toast.success("Departamento eliminado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo eliminar (¿tiene usuarios o máquinas asociadas?)"));
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="max-w-xs"
        />
      </TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon-sm">
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar departamento?</AlertDialogTitle>
              <AlertDialogDescription>
                No se podrá eliminar si tiene usuarios o máquinas asociadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createDepartment.mutateAsync(newName.trim());
      setNewName("");
      toast.success("Departamento creado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo crear el departamento"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Departamentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Nombre del nuevo departamento"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={createDepartment.isPending}>
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments?.map((d) => (
                <DepartmentRow key={d.id} department={d} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
