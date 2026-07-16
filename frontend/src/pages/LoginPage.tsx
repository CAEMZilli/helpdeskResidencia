import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { login } from "@/api/auth";
import { apiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { homeForRole } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logoBienestar from "@/assets/logo-bienestar.png";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { user, token, setSession } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (token && user) {
    return <Navigate to={homeForRole(user.rol)} replace />;
  }

  const onSubmit = async (values: LoginForm) => {
    setSubmitting(true);
    try {
      const session = await login(values.email, values.password);
      setSession(session);
      navigate(homeForRole(session.user.rol), { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo iniciar sesión"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-gradient-to-br from-[#10312B] via-[#0B231F] to-[#10312B] px-4">
      <Card className="w-full max-w-md border-t-4 border-t-accent shadow-xl">
        <CardHeader>
          <img
            src={logoBienestar}
            alt="Secretaría de Bienestar"
            className="mx-auto mb-2 h-14 w-auto"
          />
          <CardTitle className="text-center text-xl tracking-tight">CATI</CardTitle>
          <CardDescription className="text-center space-y-0.5">
            <p>Centro de Atención Técnica Informática</p>
            <p className="text-xs text-muted-foreground/80">Xalapa, Veracruz</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@ejemplo.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
