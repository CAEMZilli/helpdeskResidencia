import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateMachine, useUpdateMachine } from "@/hooks/useMachines";
import { useDepartments } from "@/hooks/useDepartments";
import { apiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import type { Maquina } from "@/types";

const machineSchema = z.object({
  serviceTag: z.string().min(1, "Requerido"),
  modelo: z.string().min(1, "Requerido"),
  IP: z.string().min(1, "Requerido"),
  numeroSerie: z.string().min(1, "Requerido"),
  departamento: z.string().min(1, "Selecciona un departamento"),
});

type MachineForm = z.infer<typeof machineSchema>;

export function MachineFormDialog({ machine }: { machine?: Maquina }) {
  const isEdit = !!machine;
  const [open, setOpen] = useState(false);
  const { data: departments } = useDepartments();
  const createMachine = useCreateMachine();
  const updateMachine = useUpdateMachine();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MachineForm>({
    resolver: zodResolver(machineSchema),
    defaultValues: machine
      ? {
          serviceTag: machine.serviceTag,
          modelo: machine.modelo,
          IP: machine.IP,
          numeroSerie: machine.numeroSerie,
          departamento: machine.departamentoId,
        }
      : undefined,
  });

  const departamento = watch("departamento");
  const isPending = createMachine.isPending || updateMachine.isPending;

  const onSubmit = async (values: MachineForm) => {
    try {
      if (isEdit) {
        await updateMachine.mutateAsync({ id: machine.id, input: values });
        toast.success("Máquina actualizada correctamente");
      } else {
        await createMachine.mutateAsync(values);
        toast.success("Máquina creada correctamente");
        reset();
      }
      setOpen(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo guardar la máquina"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="icon-sm">
            <Pencil className="size-3.5" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="size-4" />
            Nueva máquina
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar máquina" : "Nueva máquina"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="serviceTag">Service Tag</Label>
              <Input id="serviceTag" {...register("serviceTag")} />
              {errors.serviceTag && (
                <p className="text-xs text-destructive">{errors.serviceTag.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" {...register("modelo")} />
              {errors.modelo && <p className="text-xs text-destructive">{errors.modelo.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="IP">Dirección IP</Label>
              <Input id="IP" placeholder="192.168.1.50" {...register("IP")} />
              {errors.IP && <p className="text-xs text-destructive">{errors.IP.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numeroSerie">Número de serie</Label>
              <Input id="numeroSerie" {...register("numeroSerie")} />
              {errors.numeroSerie && (
                <p className="text-xs text-destructive">{errors.numeroSerie.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Departamento</Label>
            <Select
              value={departamento}
              onValueChange={(v) => setValue("departamento", v, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona uno" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departamento && (
              <p className="text-xs text-destructive">{errors.departamento.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear máquina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
