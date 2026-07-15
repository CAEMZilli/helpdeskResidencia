import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { generarDictamenPdf } from "@/lib/dictamen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Ticket } from "@/types";

const DIRECCION_DEFAULT =
  "Carretera Xalapa Veracruz Km 0+700, Col. Indeco Animas C.P. 91190, Xalapa, Ver";

const dictamenSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  direccion: z.string(),
  edificio: z.string(),
  piso: z.string(),
  areaDepartamento: z.string(),
  ur: z.string(),
  tipoEntrega: z.string(),
  telefono: z.string(),
  extension: z.string(),
  descripcionEquipo: z.string(),
  marca: z.string(),
  modelo: z.string(),
  numeroSerie: z.string(),
  piezaDanada: z.string().min(1, "Indica la pieza o equipo dañado"),
  inventario: z.string(),
  descripcionProblema: z.string(),
  observaciones: z.string(),
  determinacion: z.string().min(10, "Escribe la determinación técnica (mínimo 10 caracteres)"),
  areaDictamen: z.string(),
});

type DictamenForm = z.infer<typeof dictamenSchema>;

interface DictamenDialogProps {
  ticket: Ticket;
  reporte: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function valoresIniciales(ticket: Ticket, reporte: string): DictamenForm {
  return {
    nombre: ticket.creadoPor ? `${ticket.creadoPor.nombre} ${ticket.creadoPor.apellido}` : "",
    direccion: DIRECCION_DEFAULT,
    edificio: "",
    piso: "",
    areaDepartamento: ticket.creadoPor?.departamento?.nombre ?? "",
    ur: "150",
    tipoEntrega: "Asignación Personal",
    telefono: ticket.creadoPor?.telefono ?? "",
    extension: "",
    descripcionEquipo: ticket.maquina?.modelo ?? "",
    marca: "",
    modelo: ticket.maquina?.modelo ?? "",
    numeroSerie: ticket.maquina?.numeroSerie ?? "",
    piezaDanada: "",
    inventario: ticket.maquina?.serviceTag ?? "",
    descripcionProblema: ticket.descripcion,
    observaciones: reporte,
    determinacion: "",
    areaDictamen: "Informática",
  };
}

export function DictamenDialog({ ticket, reporte, open, onOpenChange }: DictamenDialogProps) {
  const { user } = useAuthStore();
  const [generating, setGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DictamenForm>({
    resolver: zodResolver(dictamenSchema),
    defaultValues: valoresIniciales(ticket, reporte),
  });

  useEffect(() => {
    if (open) reset(valoresIniciales(ticket, reporte));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticket.id]);

  const onSubmit = async (values: DictamenForm) => {
    setGenerating(true);
    try {
      await generarDictamenPdf(values);
      toast.success("Dictamen técnico descargado");
      onOpenChange(false);
    } catch {
      toast.error("No se pudo generar el dictamen");
    } finally {
      setGenerating(false);
    }
  };

  const field = (
    id: keyof DictamenForm,
    label: string,
    placeholder = ""
  ) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input id={id} placeholder={placeholder} {...register(id)} />
      {errors[id] && <p className="text-xs text-destructive">{errors[id]?.message}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dictamen Técnico</DialogTitle>
          <DialogDescription>
            Revisa los datos prellenados, completa los campos faltantes y descarga el
            dictamen en PDF con el formato oficial. Elaborado por: {user?.nombre}{" "}
            {user?.apellido}.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ubicación y datos del usuario que reportó
          </p>
          {field("nombre", "Nombre")}
          {field("direccion", "Dirección")}
          <div className="grid grid-cols-2 gap-3">
            {field("edificio", "Edificio", "Edificio A")}
            {field("piso", "Piso", "Planta Baja")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("areaDepartamento", "Área o Departamento")}
            {field("ur", "UR")}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {field("tipoEntrega", "Tipo de entrega")}
            {field("telefono", "Teléfono")}
            {field("extension", "Extensión")}
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">
            Descripción del equipo
          </p>
          {field("descripcionEquipo", "Descripción del equipo")}
          <div className="grid grid-cols-2 gap-3">
            {field("marca", "Marca")}
            {field("modelo", "Modelo")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("numeroSerie", "No. Serie")}
            {field("inventario", "Inventario")}
          </div>
          {field("piezaDanada", "Pieza dañada")}

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">
            Diagnóstico
          </p>
          <div className="space-y-1">
            <Label htmlFor="descripcionProblema" className="text-xs">
              Descripción del problema
            </Label>
            <Textarea id="descripcionProblema" rows={3} {...register("descripcionProblema")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="observaciones" className="text-xs">
              Observaciones
            </Label>
            <Textarea id="observaciones" rows={3} {...register("observaciones")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="determinacion" className="text-xs">
              Determinación
            </Label>
            <Textarea
              id="determinacion"
              rows={3}
              placeholder="Veredicto técnico: qué debe reemplazarse y por qué..."
              {...register("determinacion")}
            />
            {errors.determinacion && (
              <p className="text-xs text-destructive">{errors.determinacion.message}</p>
            )}
          </div>
          {field("areaDictamen", "Área o Departamento donde se realizó el dictamen")}

          <DialogFooter>
            <Button type="submit" disabled={generating}>
              {generating ? "Generando..." : "Descargar dictamen en PDF"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
