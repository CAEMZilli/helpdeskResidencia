import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTickets } from "@/hooks/useTickets";
import { useDepartments } from "@/hooks/useDepartments";
import { useCatServices } from "@/hooks/useCatServices";
import { usePagination } from "@/hooks/usePagination";
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
import { formatDateTime, formatDuration } from "@/lib/utils";

const ALL = "__ALL__";

export function HistoryPage() {
  const { user } = useAuthStore();
  const { data: tickets, isLoading } = useTickets();
  const { data: departments } = useDepartments();
  const { data: services } = useCatServices();
  const [departamentoFilter, setDepartamentoFilter] = useState(ALL);
  const [servicioFilter, setServicioFilter] = useState(ALL);

  const closedByMe = useMemo(
    () =>
      (tickets ?? [])
        .filter((t) => t.asignadoAId === user?.id && t.status === "CERRADO")
        .filter(
          (t) => departamentoFilter === ALL || t.creadoPor?.departamentoId === departamentoFilter
        )
        .filter((t) => servicioFilter === ALL || t.servicioId === servicioFilter)
        .sort(
          (a, b) => new Date(b.fechaCierre ?? b.fechaCreacion).getTime() -
            new Date(a.fechaCierre ?? a.fechaCreacion).getTime()
        ),
    [tickets, user?.id, departamentoFilter, servicioFilter]
  );

  const pagination = usePagination(closedByMe, 20);

  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departamentoFilter, servicioFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <CardTitle>Historial de tickets cerrados</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Select value={departamentoFilter} onValueChange={setDepartamentoFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los departamentos</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={servicioFilter} onValueChange={setServicioFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los servicios</SelectItem>
              {services?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            No hay tickets cerrados que coincidan con el filtro.
          </p>
        ) : (
          <>
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
                  <TableHead>Reporte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((ticket) => (
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
