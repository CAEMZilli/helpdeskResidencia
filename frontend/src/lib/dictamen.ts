import { jsPDF } from "jspdf";
import membreteUrl from "@/assets/membrete-bienestar.png";

export interface DictamenData {
  nombre: string;
  direccion: string;
  edificio: string;
  piso: string;
  areaDepartamento: string;
  ur: string;
  tipoEntrega: string;
  telefono: string;
  extension: string;
  descripcionEquipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  piezaDanada: string;
  inventario: string;
  descripcionProblema: string;
  observaciones: string;
  determinacion: string;
  areaDictamen: string;
}

// Página carta en puntos
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 60;
const CONTENT_W = PAGE_W - MARGIN * 2;

const VERDE_OSCURO: [number, number, number] = [16, 49, 43];
const BORDE: [number, number, number] = [180, 180, 180];
const TEXTO: [number, number, number] = [30, 30, 30];

const ROW_H = 18;
const SECTION_H = 15;
const LABEL_SIZE = 8;
const VALUE_SIZE = 9;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function generarDictamenPdf(data: DictamenData): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "letter", compress: true });
  const membrete = await loadImage(membreteUrl);
  doc.addImage(membrete, "PNG", 0, 0, PAGE_W, PAGE_H);

  let y = 115;

  const sectionHeader = (titulo: string) => {
    doc.setFillColor(...VERDE_OSCURO);
    doc.rect(MARGIN, y, CONTENT_W, SECTION_H, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(titulo, MARGIN + 4, y + SECTION_H / 2 + 3);
    y += SECTION_H;
  };

  // Fila de celdas etiqueta+valor. cols: [etiqueta, valor, anchoRelativo][]
  const fieldRow = (cols: Array<[string, string, number]>) => {
    const totalRel = cols.reduce((a, c) => a + c[2], 0);
    let x = MARGIN;
    doc.setDrawColor(...BORDE);
    doc.setLineWidth(0.5);
    for (const [label, value, rel] of cols) {
      const w = (rel / totalRel) * CONTENT_W;
      doc.rect(x, y, w, ROW_H, "S");
      doc.setTextColor(...VERDE_OSCURO);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(LABEL_SIZE);
      doc.text(label, x + 3, y + 7);
      doc.setTextColor(...TEXTO);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(VALUE_SIZE);
      // El valor se recorta al ancho de la celda para no invadir la siguiente
      const maxW = w - 6;
      let texto = value || "";
      while (texto.length > 0 && doc.getTextWidth(texto) > maxW) {
        texto = texto.slice(0, -1);
      }
      doc.text(texto, x + 3, y + 14.5);
      x += w;
    }
    y += ROW_H;
  };

  // Bloque de texto multilínea con borde; altura según contenido (máx. maxLines)
  const textBlock = (value: string, maxLines: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(VALUE_SIZE);
    const lines: string[] = doc.splitTextToSize(value || "", CONTENT_W - 8).slice(0, maxLines);
    const h = Math.max(24, lines.length * 11 + 8);
    doc.setDrawColor(...BORDE);
    doc.rect(MARGIN, y, CONTENT_W, h, "S");
    doc.setTextColor(...TEXTO);
    doc.text(lines, MARGIN + 4, y + 12);
    y += h;
  };

  const gap = (px = 6) => {
    y += px;
  };

  // Título
  doc.setTextColor(...VERDE_OSCURO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Dictamen Técnico", PAGE_W / 2, y, { align: "center" });
  y += 12;
  gap();

  // Fecha
  const hoy = new Date();
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  sectionHeader("Fecha");
  fieldRow([
    ["Día", String(hoy.getDate()), 1],
    ["Mes", meses[hoy.getMonth()] ?? "", 1],
    ["Año", String(hoy.getFullYear()), 1],
  ]);
  gap();

  // Ubicación y datos del usuario
  sectionHeader("Ubicación y Datos del Usuario que Reportó");
  fieldRow([["Nombre:", data.nombre, 1]]);
  fieldRow([["Dirección:", data.direccion, 1]]);
  fieldRow([
    ["Edificio:", data.edificio, 1],
    ["Piso:", data.piso, 1],
  ]);
  fieldRow([
    ["Área o Departamento:", data.areaDepartamento, 2],
    ["UR:", data.ur, 1],
  ]);
  fieldRow([
    ["Tipo de entrega:", data.tipoEntrega, 2],
    ["Teléfono:", data.telefono, 1],
    ["Extensión:", data.extension, 1],
  ]);
  gap();

  // Descripción del equipo
  sectionHeader("Descripción del Equipo");
  fieldRow([["Descripción del equipo:", data.descripcionEquipo, 1]]);
  fieldRow([
    ["Marca:", data.marca, 1],
    ["Modelo:", data.modelo, 1],
  ]);
  fieldRow([
    ["No. Serie:", data.numeroSerie, 1],
    ["Inventario:", data.inventario, 1],
  ]);
  fieldRow([["Pieza dañada:", data.piezaDanada, 1]]);
  gap();

  sectionHeader("Descripción del problema");
  textBlock(data.descripcionProblema, 5);
  gap();

  sectionHeader("Observaciones");
  textBlock(data.observaciones, 5);
  gap();

  sectionHeader("Determinación");
  textBlock(data.determinacion, 5);
  gap();

  fieldRow([["Área o Departamento donde se realizó el dictamen:", data.areaDictamen, 1]]);

  const fecha = hoy.toISOString().slice(0, 10);
  const ref = (data.inventario || data.numeroSerie || "equipo").replace(/[^\w-]/g, "_");
  doc.save(`Dictamen_Tecnico_${ref}_${fecha}.pdf`);
}
