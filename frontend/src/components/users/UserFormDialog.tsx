import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateUser } from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";
import { apiErrorMessage } from "@/api/client";
import { ROLES } from "@/types";
import { ROLE_LABELS } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";

const userSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  apellido: z.string().min(1, "Requerido"),
  email: z.string().email("Correo inválido"),
  telefono: z.string().min(1, "Requerido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  rol: z.enum(ROLES),
  departamento: z.string().min(1, "Selecciona un departamento"),
});

type UserForm = z.infer<typeof userSchema>;

export function UserFormDialog() {
  const [open, setOpen] = useState(false);
  const { data: departments } = useDepartments();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserForm>({ resolver: zodResolver(userSchema) });

  const rol = watch("rol");
  const departamento = watch("departamento");

  const onSubmit = async (values: UserForm) => {
    try {
      await createUser.mutateAsync(values);
      toast.success("Usuario creado correctamente");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo crear el usuario"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" />
          Nuevo usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" {...register("apellido")} />
              {errors.apellido && (
                <p className="text-xs text-destructive">{errors.apellido.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register("telefono")} />
              {errors.telefono && (
                <p className="text-xs text-destructive">{errors.telefono.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={rol} onValueChange={(v) => setValue("rol", v as UserForm["rol"], { shouldValidate: true })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rol && <p className="text-xs text-destructive">{errors.rol.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Departamento</Label>
              <Select
                value={departamento}
                onValueChange={(v) => setValue("departamento", v, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona uno" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departamento && (
                <p className="text-xs text-destructive">{errors.departamento.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
