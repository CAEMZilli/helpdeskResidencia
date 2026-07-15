import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import type { Ticket } from "@/types";

export function TicketNoteDialog({ ticket }: { ticket: Ticket }) {
  if (!ticket.notaCierre) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" title="Ver reporte de cierre">
          <FileText className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reporte de cierre</DialogTitle>
          <DialogDescription>
            {ticket.asunto} · Cerrado el {formatDateTime(ticket.fechaCierre)}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm whitespace-pre-wrap">{ticket.notaCierre}</p>
      </DialogContent>
    </Dialog>
  );
}
