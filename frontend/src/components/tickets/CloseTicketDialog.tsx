import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { useUpdateTicket } from "@/hooks/useTickets";
import { apiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DictamenDialog } from "@/components/tickets/DictamenDialog";
import type { Ticket } from "@/types";

const closeSchema = z.object({
  notaCierre: z
    .string()
    .min(10, "Describe brevemente qué se hizo para resolver el problema (mínimo 10 caracteres)"),
});

type CloseForm = z.infer<typeof closeSchema>;

interface CloseTicketDialogProps {
  ticket: Ticket | null;
  onOpenChange: (open: boolean) => void;
}

export function CloseTicketDialog({ ticket, onOpenChange }: CloseTicketDialogProps) {
  const { user } = useAuthStore();
  const updateTicket = useUpdateTicket();
  const [dictamenOpen, setDictamenOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CloseForm>({ resolver: zodResolver(closeSchema) });

  const notaActual = watch("notaCierre") ?? "";

  const onSubmit = async (values: CloseForm) => {
    if (!ticket) return;
    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        input: { status: "CERRADO", notaCierre: values.notaCierre },
      });
      toast.success("Ticket cerrado correctamente");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo cerrar el ticket"));
    }
  };

  return (
    <Dialog
      open={!!ticket}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar ticket</DialogTitle>
          <DialogDescription>
            Escribe un reporte de la solución antes de cerrar. Quedará disponible para el
            usuario y el administrador.
          </DialogDescription>
        </DialogHeader>
        {ticket && (
          <>
            <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Asunto:</span> {ticket.asunto}
              </p>
              <p>
                <span className="text-muted-foreground">Atendido por:</span>{" "}
                {user?.nombre} {user?.apellido}
              </p>
              <p>
                <span className="text-muted-foreground">Reportado por:</span>{" "}
                {ticket.creadoPor ? `${ticket.creadoPor.nombre} ${ticket.creadoPor.apellido}` : "—"}
              </p>
              {ticket.creadoPor?.departamento && (
                <p>
                  <span className="text-muted-foreground">Departamento:</span>{" "}
                  {ticket.creadoPor.departamento.nombre}
                </p>
              )}
              {ticket.maquina && (
                <p>
                  <span className="text-muted-foreground">Equipo:</span> {ticket.maquina.modelo} ·{" "}
                  {ticket.maquina.serviceTag}
                </p>
              )}
            </div>
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label htmlFor="notaCierre">Reporte de cierre</Label>
                <Textarea
                  id="notaCierre"
                  rows={5}
                  placeholder="Describe qué se hizo para resolver el problema..."
                  {...register("notaCierre")}
                />
                {errors.notaCierre && (
                  <p className="text-xs text-destructive">{errors.notaCierre.message}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                ¿La falla requirió reemplazar una pieza o equipo? Genera el dictamen técnico
                oficial antes o después de cerrar.
              </p>
              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDictamenOpen(true)}
                >
                  <FileDown className="size-4" />
                  Generar dictamen técnico
                </Button>
                <Button type="submit" disabled={updateTicket.isPending}>
                  {updateTicket.isPending ? "Cerrando..." : "Cerrar ticket"}
                </Button>
              </DialogFooter>
            </form>
            <DictamenDialog
              ticket={ticket}
              reporte={notaActual}
              open={dictamenOpen}
              onOpenChange={setDictamenOpen}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
