import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { Monitor, Moon, Sun } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/store/authStore";
import { apiErrorMessage } from "@/api/client";
import { roleLabel } from "@/constants/roles";
import { formatDateTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const emailSchema = z.object({
  correoSecundario: z
    .string()
    .email("Escribe un correo válido")
    .or(z.literal("")),
});

type EmailForm = z.infer<typeof emailSchema>;

const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/60 last:border-b-0 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user: authUser } = useAuthStore();
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateUser = useUpdateUser();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { correoSecundario: "" },
  });

  useEffect(() => {
    reset({ correoSecundario: currentUser?.correoSecundario ?? "" });
  }, [currentUser?.correoSecundario, reset]);

  const saveEmail = async (values: EmailForm) => {
    if (!authUser) return;
    try {
      await updateUser.mutateAsync({
        id: authUser.id,
        // string vacío = quitar el correo secundario (el backend lo guarda como null)
        input: { correoSecundario: values.correoSecundario === "" ? null : values.correoSecundario },
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser", authUser.id] });
      toast.success(
        values.correoSecundario === ""
          ? "Correo secundario eliminado"
          : "Correo secundario guardado"
      );
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo guardar el correo secundario"));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Elige cómo se ve la plataforma en este dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                  theme === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <option.icon className="size-5" />
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Con "Sistema", la plataforma sigue el modo claro u oscuro configurado en tu equipo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mi información</CardTitle>
          <CardDescription>
            Estos datos los administra el Departamento de Informática. Si algo es incorrecto,
            solicita la corrección a un administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !currentUser ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div>
              <InfoRow label="Nombre" value={`${currentUser.nombre} ${currentUser.apellido}`} />
              <InfoRow label="Correo institucional" value={currentUser.email} />
              <InfoRow label="Teléfono" value={currentUser.telefono} />
              <InfoRow label="Rol" value={roleLabel(currentUser.rol)} />
              <InfoRow label="Departamento" value={currentUser.departamento?.nombre ?? "—"} />
              <InfoRow label="Fecha de alta" value={formatDateTime(currentUser.fechaCreacion)} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Correo secundario</CardTitle>
          <CardDescription>
            Un correo de contacto alterno por si no es posible localizarte en el institucional.
            Déjalo vacío y guarda para quitarlo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit(saveEmail)}>
            <div className="space-y-1.5">
              <Label htmlFor="correoSecundario">Correo secundario</Label>
              <Input
                id="correoSecundario"
                type="email"
                placeholder="tu.correo@ejemplo.com"
                {...register("correoSecundario")}
              />
              {errors.correoSecundario && (
                <p className="text-xs text-destructive">{errors.correoSecundario.message}</p>
              )}
            </div>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
