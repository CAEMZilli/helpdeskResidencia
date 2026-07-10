import { useMemo } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useTickets, useUpdateTicket } from "@/hooks/useTickets";
import { apiErrorMessage } from "@/api/client";
import { ESTADO_FLOW, ESTADO_LABELS } from "@/constants/roles";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import type { Ticket } from "@/types";

function TicketCard({
  ticket,
  onTake,
  onAdvance,
  busy,
}: {
  ticket: Ticket;
  onTake?: () => void;
  onAdvance?: () => void;
  busy: boolean;
}) {
  const nextStatus = ESTADO_FLOW[ticket.status];

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">{ticket.asunto}</p>
            <p className="text-xs text-muted-foreground">
              {ticket.servicio?.nombre ?? "Servicio no especificado"} · Creado por{" "}
              {ticket.creadoPor ? `${ticket.creadoPor.nombre} ${ticket.creadoPor.apellido}` : "—"}
              {ticket.creadoPor?.departamento && ` (${ticket.creadoPor.departamento.nombre})`}
            </p>
            {ticket.maquina && (
              <p className="text-xs text-muted-foreground">
                Equipo: {ticket.maquina.modelo} · {ticket.maquina.serviceTag}
              </p>
            )}
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>
        <p className="text-sm">{ticket.descripcion}</p>
        <p className="text-xs text-muted-foreground">Creado: {formatDateTime(ticket.fechaCreacion)}</p>
        <div className="flex gap-2">
          {onTake && (
            <Button size="sm" onClick={onTake} disabled={busy}>
              Tomar ticket
            </Button>
          )}
          {onAdvance && nextStatus && (
            <Button size="sm" variant="outline" onClick={onAdvance} disabled={busy}>
              Marcar como {ESTADO_LABELS[nextStatus]}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketQueuePage() {
  const { user } = useAuthStore();
  const { data: tickets, isLoading } = useTickets({ poll: true });
  const updateTicket = useUpdateTicket();

  const { unassigned, mine } = useMemo(() => {
    const all = tickets ?? [];
    return {
      unassigned: all
        .filter((t) => !t.asignadoAId && t.status !== "CERRADO")
        .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()),
      mine: all
        .filter((t) => t.asignadoAId === user?.id && t.status !== "CERRADO")
        .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()),
    };
  }, [tickets, user?.id]);

  const handleTake = async (ticket: Ticket) => {
    if (!user) return;
    try {
      await updateTicket.mutateAsync({ id: ticket.id, input: { asignadoA: user.id } });
      toast.success("Ticket asignado a ti");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo tomar el ticket"));
    }
  };

  const handleAdvance = async (ticket: Ticket) => {
    const next = ESTADO_FLOW[ticket.status];
    if (!next) return;
    try {
      await updateTicket.mutateAsync({ id: ticket.id, input: { status: next } });
      toast.success(`Ticket marcado como ${ESTADO_LABELS[next]}`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo actualizar el ticket"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Sin asignar ({unassigned.length})
        </h2>
        {unassigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay tickets pendientes por tomar.</p>
        ) : (
          <div className="space-y-3">
            {unassigned.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                busy={updateTicket.isPending}
                onTake={() => handleTake(ticket)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Asignados a mí ({mine.length})
        </h2>
        {mine.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tienes tickets asignados activos.</p>
        ) : (
          <div className="space-y-3">
            {mine.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                busy={updateTicket.isPending}
                onAdvance={() => handleAdvance(ticket)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
