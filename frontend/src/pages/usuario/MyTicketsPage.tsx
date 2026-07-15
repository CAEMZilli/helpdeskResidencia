import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTickets } from "@/hooks/useTickets";
import { usePagination } from "@/hooks/usePagination";
import { ESTADO_LABELS } from "@/constants/roles";
import { ESTADOS_TICKET } from "@/types";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { TicketNoteDialog } from "@/components/tickets/TicketNoteDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";

const ALL = "__ALL__";

export function MyTicketsPage() {
  const { user } = useAuthStore();
  const { data: tickets, isLoading } = useTickets();
  const [statusFilter, setStatusFilter] = useState(ALL);

  const myTickets = useMemo(
    () =>
      (tickets ?? [])
        .filter((t) => t.creadoPorId === user?.id)
        .filter((t) => statusFilter === ALL || t.status === statusFilter)
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()),
    [tickets, user?.id, statusFilter]
  );

  const pagination = usePagination(myTickets, 20);

  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <CardTitle>Mis tickets</CardTitle>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar por estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estatus</SelectItem>
            {ESTADOS_TICKET.map((status) => (
              <SelectItem key={status} value={status}>
                {ESTADO_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : myTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay tickets que coincidan con el filtro.
          </p>
        ) : (
          <>
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
                  <TableHead>Reporte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((ticket) => (
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
                    <TableCell>
                      <TicketNoteDialog ticket={ticket} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={pagination.setPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
