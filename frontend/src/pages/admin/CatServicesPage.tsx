import { useState } from "react";
import { toast } from "sonner";
import {
  useCatServices,
  useCreateCatService,
  useDeleteCatService,
  useUpdateCatService,
} from "@/hooks/useCatServices";
import { apiErrorMessage } from "@/api/client";
import { TIPO_SERVICIO_LABELS } from "@/constants/roles";
import { TIPOS_SERVICIO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import type { CatServicio, TipoServicio } from "@/types";

function CatServiceRow({ service }: { service: CatServicio }) {
  const [nombre, setNombre] = useState(service.nombre);
  const [tipo, setTipo] = useState<TipoServicio>(service.tipo);
  const updateService = useUpdateCatService();
  const deleteService = useDeleteCatService();

  const persist = async (nextNombre: string, nextTipo: TipoServicio) => {
    if (nextNombre === service.nombre && nextTipo === service.tipo) return;
    if (!nextNombre.trim()) return;
    try {
      await updateService.mutateAsync({ id: service.id, nombre: nextNombre.trim(), tipo: nextTipo });
      toast.success("Servicio actualizado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo actualizar"));
      setNombre(service.nombre);
      setTipo(service.tipo);
    }
  };

  const remove = async () => {
    try {
      await deleteService.mutateAsync(service.id);
      toast.success("Servicio eliminado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo eliminar"));
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => persist(nombre, tipo)}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="max-w-xs"
        />
      </TableCell>
      <TableCell>
        <Select
          value={tipo}
          onValueChange={(v) => {
            const nextTipo = v as TipoServicio;
            setTipo(nextTipo);
            persist(nombre, nextTipo);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_SERVICIO.map((t) => (
              <SelectItem key={t} value={t}>
                {TIPO_SERVICIO_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <AlertDialogTitle>¿Eliminar servicio del catálogo?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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

export function CatServicesPage() {
  const { data: services, isLoading } = useCatServices();
  const createService = useCreateCatService();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<TipoServicio>("SOFTWARE");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createService.mutateAsync({ nombre: newName.trim(), tipo: newType });
      setNewName("");
      toast.success("Servicio creado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo crear el servicio"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catálogo de servicios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 max-w-lg">
          <Input
            placeholder="Nombre del servicio"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Select value={newType} onValueChange={(v) => setNewType(v as TipoServicio)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_SERVICIO.map((t) => (
                <SelectItem key={t} value={t}>
                  {TIPO_SERVICIO_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreate} disabled={createService.isPending}>
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
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services?.map((s) => (
                <CatServiceRow key={s.id} service={s} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
