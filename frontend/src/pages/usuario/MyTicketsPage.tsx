import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTickets } from "@/hooks/useTickets";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";

export function MyTicketsPage() {
  const { user } = useAuthStore();
  const { data: tickets, isLoading } = useTickets();

  const myTickets = useMemo(
    () =>
      (tickets ?? [])
        .filter((t) => t.creadoPorId === user?.id)
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()),
    [tickets, user?.id]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : myTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no has creado ningún ticket.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asunto</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Técnico asignado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Cerrado</TableHead>
                <TableHead>Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.asunto}</TableCell>
                  <TableCell>{ticket.servicio?.nombre ?? "—"}</TableCell>
                  <TableCell>{ticket.creadoPor?.departamento?.nombre ?? "—"}</TableCell>
                  <TableCell>
                    {ticket.maquina ? `${ticket.maquina.modelo} (${ticket.maquina.serviceTag})` : "—"}
                  </TableCell>
                  <TableCell>
                    {ticket.asignadoA
                      ? `${ticket.asignadoA.nombre} ${ticket.asignadoA.apellido}`
                      : "Sin asignar"}
                  </TableCell>
                  <TableCell>{formatDateTime(ticket.fechaCreacion)}</TableCell>
                  <TableCell>{formatDateTime(ticket.fechaCierre)}</TableCell>
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
