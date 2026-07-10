import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTickets } from "@/hooks/useTickets";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatDuration } from "@/lib/utils";

export function HistoryPage() {
  const { user } = useAuthStore();
  const { data: tickets, isLoading } = useTickets();

  const closedByMe = useMemo(
    () =>
      (tickets ?? [])
        .filter((t) => t.asignadoAId === user?.id && t.status === "CERRADO")
        .sort(
          (a, b) => new Date(b.fechaCierre ?? b.fechaCreacion).getTime() -
            new Date(a.fechaCierre ?? a.fechaCreacion).getTime()
        ),
    [tickets, user?.id]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de tickets cerrados</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : closedByMe.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no has cerrado ningún ticket.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asunto</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Cerrado</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closedByMe.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.asunto}</TableCell>
                  <TableCell>{ticket.creadoPor?.departamento?.nombre ?? "—"}</TableCell>
                  <TableCell>
                    {ticket.maquina ? `${ticket.maquina.modelo} (${ticket.maquina.serviceTag})` : "—"}
                  </TableCell>
                  <TableCell>{ticket.servicio?.nombre ?? "—"}</TableCell>
                  <TableCell>{formatDateTime(ticket.fechaCreacion)}</TableCell>
                  <TableCell>{formatDateTime(ticket.fechaCierre)}</TableCell>
                  <TableCell>{formatDuration(ticket.fechaCreacion, ticket.fechaCierre)}</TableCell>
                  <TableCell>
                    <TicketStatusBadge status={ticket.status} />
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
