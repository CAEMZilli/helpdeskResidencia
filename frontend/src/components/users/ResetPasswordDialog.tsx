import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { useUpdateUser } from "@/hooks/useUsers";
import { apiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Usuario } from "@/types";

const resetSchema = z
  .object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmar: z.string(),
  })
  .refine((data) => data.password === data.confirmar, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordDialog({ usuario }: { usuario: Usuario }) {
  const [open, setOpen] = useState(false);
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (values: ResetForm) => {
    try {
      await updateUser.mutateAsync({ id: usuario.id, input: { password: values.password } });
      toast.success("Contraseña restablecida. Comunícala al usuario para que la cambie después.");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo restablecer la contraseña"));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" title="Restablecer contraseña">
          <KeyRound className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            Define una nueva contraseña para {usuario.nombre} {usuario.apellido} ({usuario.email}).
            Anótala para dictársela; el usuario podrá cambiarla después.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" type="text" autoComplete="off" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmar">Confirmar contraseña</Label>
            <Input id="confirmar" type="text" autoComplete="off" {...register("confirmar")} />
            {errors.confirmar && (
              <p className="text-xs text-destructive">{errors.confirmar.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Guardando..." : "Restablecer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
