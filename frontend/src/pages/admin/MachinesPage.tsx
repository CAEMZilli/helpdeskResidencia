import { toast } from "sonner";
import { useMachines, useDeleteMachine } from "@/hooks/useMachines";
import { apiErrorMessage } from "@/api/client";
import { MachineFormDialog } from "@/components/machines/MachineFormDialog";
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

export function MachinesPage() {
  const { data: machines, isLoading } = useMachines();
  const deleteMachine = useDeleteMachine();

  const handleDelete = async (id: string) => {
    try {
      await deleteMachine.mutateAsync(id);
      toast.success("Máquina eliminada");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo eliminar la máquina"));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Máquinas</CardTitle>
        <MachineFormDialog />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : machines?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay máquinas registradas todavía.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Tag</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Número de serie</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines?.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.serviceTag}</TableCell>
                  <TableCell>{m.modelo}</TableCell>
                  <TableCell>{m.IP}</TableCell>
                  <TableCell>{m.numeroSerie}</TableCell>
                  <TableCell>{m.departamento?.nombre ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <MachineFormDialog machine={m} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon-sm">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar máquina?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(m.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
