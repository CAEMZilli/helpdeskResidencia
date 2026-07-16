import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCatServices } from "@/hooks/useCatServices";
import { useCreateTicket } from "@/hooks/useTickets";
import { useMachines } from "@/hooks/useMachines";
import { apiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TIPO_SERVICIO_LABELS } from "@/constants/roles";
import { TIPOS_SERVICIO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ticketSchema = z.object({
  asunto: z.string().min(3, "El asunto debe tener al menos 3 caracteres"),
  descripcion: z.string().min(10, "Describe el problema con más detalle"),
  servicio: z.string().min(1, "Selecciona un servicio"),
  maquina: z.string().optional(),
});

type TicketForm = z.infer<typeof ticketSchema>;

export function NewTicketPage() {
  const { user } = useAuthStore();
  const { data: currentUser } = useCurrentUser();
  const { data: services, isLoading: loadingServices } = useCatServices();
  const { data: machines, isLoading: loadingMachines } = useMachines();
  const createTicket = useCreateTicket();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TicketForm>({ resolver: zodResolver(ticketSchema) });

  const servicio = watch("servicio");
  const maquina = watch("maquina");

  // Agrupado por tipo (en el orden del catálogo) y alfabético por nombre dentro de cada grupo.
  const serviceOptions = useMemo(() => {
    const tipoOrder = new Map(TIPOS_SERVICIO.map((tipo, index) => [tipo, index]));
    return (services ?? [])
      .slice()
      .sort((a, b) => {
        const tipoDiff = (tipoOrder.get(a.tipo) ?? 0) - (tipoOrder.get(b.tipo) ?? 0);
        return tipoDiff !== 0 ? tipoDiff : a.nombre.localeCompare(b.nombre, "es");
      })
      .map((s) => ({
        value: s.id,
        label: s.nombre,
        group: TIPO_SERVICIO_LABELS[s.tipo],
      }));
  }, [services]);

  // Todas las máquinas del catálogo, sin filtrar por departamento: es común
  // que alguien reporte un problema trabajando fuera de su área asignada.
  const machineOptions = useMemo(
    () =>
      (machines ?? [])
        .slice()
        .sort((a, b) => a.modelo.localeCompare(b.modelo, "es") || a.serviceTag.localeCompare(b.serviceTag, "es"))
        .map((m) => ({
          value: m.id,
          label: `${m.modelo} · ${m.serviceTag}${m.departamento ? ` — ${m.departamento.nombre}` : ""}`,
        })),
    [machines]
  );

  const onSubmit = async (values: TicketForm) => {
    if (!user) return;
    try {
      await createTicket.mutateAsync({
        creadoPor: user.id,
        asunto: values.asunto,
        descripcion: values.descripcion,
        servicio: values.servicio,
        ...(values.maquina ? { maquina: values.maquina } : {}),
      });
      toast.success("Ticket creado correctamente");
      reset();
      navigate("/usuario/mis-tickets");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo crear el ticket"));
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Crear nuevo ticket</CardTitle>
        <CardDescription>
          Describe el problema que tienes y un técnico lo atenderá lo antes posible.
          {currentUser?.departamento && (
            <>
              {" "}
              Se registrará para el departamento de <strong>{currentUser.departamento.nombre}</strong>.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="asunto">Asunto</Label>
            <Input id="asunto" placeholder="Falla en equipo de cómputo" {...register("asunto")} />
            {errors.asunto && (
              <p className="text-xs text-destructive">{errors.asunto.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="servicio">Servicio</Label>
            <SearchableSelect
              id="servicio"
              options={serviceOptions}
              value={servicio}
              onChange={(value) => setValue("servicio", value ?? "", { shouldValidate: true })}
              placeholder="Busca un servicio..."
              emptyText="No se encontró ningún servicio."
              disabled={loadingServices}
            />
            {errors.servicio && (
              <p className="text-xs text-destructive">{errors.servicio.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maquina">Máquina (opcional)</Label>
            <SearchableSelect
              id="maquina"
              options={machineOptions}
              value={maquina}
              onChange={(value) => setValue("maquina", value)}
              placeholder="Busca un equipo (si aplica)..."
              emptyText="No se encontró ningún equipo."
              disabled={loadingMachines}
            />
            {!loadingMachines && machineOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Todavía no hay equipos registrados en el catálogo.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              rows={5}
              placeholder="Describe el problema con el mayor detalle posible..."
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          <Button type="submit" disabled={createTicket.isPending}>
            {createTicket.isPending ? "Enviando..." : "Crear ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
