import { useEffect, useMemo, useState } from "react";
import { useTickets } from "@/hooks/useTickets";
import { useUsers } from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";
import { usePagination } from "@/hooks/usePagination";
import { ESTADO_LABELS, normalizeRol } from "@/constants/roles";
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
import type { EstadoTicket } from "@/types";

const ALL = "__ALL__";

export function DashboardPage() {
  const { data: tickets, isLoading: loadingTickets } = useTickets();
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: departments } = useDepartments();
  const [tecnicoFilter, setTecnicoFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [departamentoFilter, setDepartamentoFilter] = useState(ALL);

  const tecnicos = useMemo(
    () => (users ?? []).filter((u) => normalizeRol(u.rol) === "TECNICO"),
    [users]
  );

  const summary = useMemo(() => {
    return tecnicos.map((tecnico) => {
      const assigned = (tickets ?? []).filter((t) => t.asignadoAId === tecnico.id);
      const counts = Object.fromEntries(
        ESTADOS_TICKET.map((status) => [status, assigned.filter((t) => t.status === status).length])
      ) as Record<EstadoTicket, number>;
      return { tecnico, total: assigned.length, counts };
    });
  }, [tecnicos, tickets]);

  const filteredTickets = useMemo(() => {
    return (tickets ?? [])
      .filter((t) => tecnicoFilter === ALL || t.asignadoAId === tecnicoFilter)
      .filter((t) => statusFilter === ALL || t.status === statusFilter)
      .filter(
        (t) => departamentoFilter === ALL || t.creadoPor?.departamentoId === departamentoFilter
      )
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }, [tickets, tecnicoFilter, statusFilter, departamentoFilter]);

  const pagination = usePagination(filteredTickets, 20);

  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tecnicoFilter, statusFilter, departamentoFilter]);

  const isLoading = loadingTickets || loadingUsers;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Tickets por técnico
        </h2>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : summary.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay técnicos registrados todavía.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.map(({ tecnico, total, counts }) => (
              <Card key={tecnico.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {tecnico.nombre} {tecnico.apellido}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{total} ticket(s) asignados</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {ESTADOS_TICKET.map((status) => (
                    <div key={status} className="flex items-center gap-1.5 text-xs">
                      <TicketStatusBadge status={status} />
                      <span className="text-muted-foreground">{counts[status]}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <CardTitle>Todos los tickets</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={tecnicoFilter} onValueChange={setTecnicoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos los técnicos</SelectItem>
                {tecnicos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre} {t.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : filteredTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay tickets que coincidan con el filtro.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Creado por</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Máquina</TableHead>
                    <TableHead>Técnico</TableHead>
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
                      <TableCell>
                        {ticket.creadoPor
                          ? `${ticket.creadoPor.nombre} ${ticket.creadoPor.apellido}`
                          : "—"}
                      </TableCell>
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
    </div>
  );
}
