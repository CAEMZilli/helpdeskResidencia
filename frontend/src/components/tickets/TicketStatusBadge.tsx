import { Badge } from "@/components/ui/badge";
import { ESTADO_BADGE_VARIANT, ESTADO_LABELS } from "@/constants/roles";
import { cn } from "@/lib/utils";
import type { EstadoTicket } from "@/types";

export function TicketStatusBadge({ status }: { status: EstadoTicket }) {
  return (
    <Badge className={cn("border font-medium", ESTADO_BADGE_VARIANT[status])} variant="outline">
      {ESTADO_LABELS[status]}
    </Badge>
  );
}
