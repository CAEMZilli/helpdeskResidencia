import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/types";
import { ROLE_LABELS } from "@/constants/roles";
import type { Rol } from "@/types";

export function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: Rol) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Rol)} disabled={disabled}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((rol) => (
          <SelectItem key={rol} value={rol}>
            {ROLE_LABELS[rol]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
