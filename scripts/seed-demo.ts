/**
 * Script de siembra de datos de prueba (departamentos, usuarios, máquinas y
 * tickets ficticios con fechas históricas). Usa PrismaClient directo en vez
 * de la API HTTP porque createTicket/updateTicket no permiten fijar
 * fechaCreacion/fechaCierre manualmente. Idempotente: puede volver a
 * ejecutarse sin duplicar departamentos, usuarios ni máquinas ya creados por
 * este mismo script.
 *
 * Uso: npx tsx scripts/seed-demo.ts
 */
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/db";
import type { EstadoTicket } from "@prisma/client";

const DEMO_PASSWORD = "Demo2026!";

const DEPARTMENTS = ["Atención Ciudadana", "Jurídico", "Comunicación Social", "Programas Sociales"];

const USERS: Array<{
  nombre: string;
  apellido: string;
  rol: "USUARIO" | "TECNICO";
  departamento: string;
  telefono: string;
}> = [
  { nombre: "María Fernanda", apellido: "López", rol: "USUARIO", departamento: "Atención Ciudadana", telefono: "2281000001" },
  { nombre: "Jorge Alberto", apellido: "Ramírez", rol: "USUARIO", departamento: "Jurídico", telefono: "2281000002" },
  { nombre: "Ana Karen", apellido: "Sánchez", rol: "USUARIO", departamento: "Comunicación Social", telefono: "2281000003" },
  { nombre: "Roberto Carlos", apellido: "Hernández", rol: "USUARIO", departamento: "Programas Sociales", telefono: "2281000004" },
  { nombre: "Diana Laura", apellido: "Torres", rol: "USUARIO", departamento: "Finanzas", telefono: "2281000005" },
  { nombre: "Miguel Ángel", apellido: "Cruz", rol: "USUARIO", departamento: "Recursos Humanos", telefono: "2281000006" },
  { nombre: "Patricia Elena", apellido: "Vázquez", rol: "USUARIO", departamento: "Informatica", telefono: "2281000007" },
  { nombre: "Sergio Iván", apellido: "Morales", rol: "TECNICO", departamento: "Informatica", telefono: "2281000008" },
  { nombre: "Claudia Beatriz", apellido: "Reyes", rol: "TECNICO", departamento: "Informatica", telefono: "2281000009" },
  { nombre: "Fernando Daniel", apellido: "Ortiz", rol: "USUARIO", departamento: "Atención Ciudadana", telefono: "2281000010" },
  { nombre: "Gabriela Montserrat", apellido: "Flores", rol: "USUARIO", departamento: "Jurídico", telefono: "2281000011" },
  { nombre: "Ricardo Emilio", apellido: "Castillo", rol: "USUARIO", departamento: "Programas Sociales", telefono: "2281000012" },
];

const MACHINES: Array<{ serviceTag: string; modelo: string; IP: string; numeroSerie: string; departamento: string }> = [
  { serviceTag: "ST-ATC-001", modelo: "HP EliteDesk 800", IP: "192.168.2.10", numeroSerie: "NS-ATC-001", departamento: "Atención Ciudadana" },
  { serviceTag: "ST-JUR-001", modelo: "Lenovo ThinkCentre M70", IP: "192.168.2.20", numeroSerie: "NS-JUR-001", departamento: "Jurídico" },
  { serviceTag: "ST-COM-001", modelo: "Dell OptiPlex 5090", IP: "192.168.2.30", numeroSerie: "NS-COM-001", departamento: "Comunicación Social" },
  { serviceTag: "ST-PS-001", modelo: "HP ProDesk 400", IP: "192.168.2.40", numeroSerie: "NS-PS-001", departamento: "Programas Sociales" },
  { serviceTag: "ST-FIN-001", modelo: "Lenovo ThinkCentre M90", IP: "192.168.2.50", numeroSerie: "NS-FIN-001", departamento: "Finanzas" },
  { serviceTag: "ST-RH-001", modelo: "Dell OptiPlex 3090", IP: "192.168.2.60", numeroSerie: "NS-RH-001", departamento: "Recursos Humanos" },
];

const TICKET_SUBJECTS: Array<{ asunto: string; descripcion: string }> = [
  { asunto: "No enciende la computadora", descripcion: "Al presionar el botón de encendido no responde, ya se revisó el cable de corriente." },
  { asunto: "Impresora no imprime", descripcion: "La impresora del área muestra atasco de papel pero no hay ningún papel atorado visible." },
  { asunto: "Sin acceso a internet", descripcion: "Desde esta mañana no hay conexión a internet en todo el piso." },
  { asunto: "Correo institucional no sincroniza", descripcion: "Outlook no descarga correos nuevos desde ayer por la tarde." },
  { asunto: "Solicitud de instalación de software", descripcion: "Se requiere instalar el paquete de office actualizado en el equipo." },
  { asunto: "Teléfono IP sin tono", descripcion: "La extensión telefónica no tiene tono desde esta mañana." },
  { asunto: "Equipo muy lento", descripcion: "La computadora tarda varios minutos en abrir cualquier programa." },
  { asunto: "Pantalla azul recurrente", descripcion: "El equipo se reinicia solo mostrando pantalla azul varias veces al día." },
  { asunto: "Solicitud de cambio de periférico", descripcion: "El mouse dejó de funcionar correctamente, se traba al hacer clic." },
  { asunto: "Configuración de red inalámbrica", descripcion: "Se necesita configurar el acceso a la red WiFi institucional en equipo nuevo." },
  { asunto: "Recuperación de archivos borrados", descripcion: "Se eliminaron por accidente varios documentos importantes de un proyecto." },
  { asunto: "Actualización de sistema operativo pendiente", descripcion: "El equipo solicita una actualización de Windows que no ha podido completarse." },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  const item = arr[randomInt(0, arr.length - 1)];
  if (item === undefined) throw new Error("No se puede elegir de un arreglo vacío");
  return item;
}

function daysAgo(days: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("Sembrando datos de prueba...\n");

  // --- Departamentos ---
  const departamentoByName = new Map<string, string>();
  const existingDepartamentos = await prisma.departamento.findMany();
  for (const d of existingDepartamentos) departamentoByName.set(d.nombre, d.id);

  let createdDepartamentos = 0;
  for (const nombre of DEPARTMENTS) {
    if (departamentoByName.has(nombre)) continue;
    const created = await prisma.departamento.create({ data: { nombre } });
    departamentoByName.set(nombre, created.id);
    createdDepartamentos++;
  }

  // --- Usuarios ---
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  let createdUsuarios = 0;
  const createdCredentials: string[] = [];
  const usuarioIdsByRol: Record<"USUARIO" | "TECNICO", string[]> = { USUARIO: [], TECNICO: [] };

  for (const u of USERS) {
    const departamentoId = departamentoByName.get(u.departamento);
    if (!departamentoId) throw new Error(`Departamento no encontrado: ${u.departamento}`);

    const email = `${u.nombre.split(" ")[0]!.toLowerCase()}.${u.apellido.split(" ")[0]!.toLowerCase()}@bienestar-demo.local`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

    let usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nombre: u.nombre,
          apellido: u.apellido,
          rol: u.rol,
          email,
          telefono: u.telefono,
          password: hashedPassword,
          departamentoId,
        },
      });
      createdUsuarios++;
      createdCredentials.push(`${email} — ${DEMO_PASSWORD} (${u.rol})`);
    }
    usuarioIdsByRol[u.rol].push(usuario.id);
  }

  // Incluir también a los técnicos ya existentes (de pruebas previas) como posibles asignados.
  const existingTecnicos = await prisma.usuario.findMany({
    where: { rol: { in: ["TECNICO", "Tecnico"] } },
  });
  for (const t of existingTecnicos) {
    if (!usuarioIdsByRol.TECNICO.includes(t.id)) usuarioIdsByRol.TECNICO.push(t.id);
  }

  // --- Máquinas ---
  let createdMaquinas = 0;
  const maquinaIdsByDept = new Map<string, string[]>();
  const existingMaquinas = await prisma.maquina.findMany();
  for (const m of existingMaquinas) {
    const list = maquinaIdsByDept.get(m.departamentoId) ?? [];
    list.push(m.id);
    maquinaIdsByDept.set(m.departamentoId, list);
  }

  for (const m of MACHINES) {
    const departamentoId = departamentoByName.get(m.departamento);
    if (!departamentoId) throw new Error(`Departamento no encontrado: ${m.departamento}`);

    let maquina = await prisma.maquina.findUnique({ where: { serviceTag: m.serviceTag } });
    if (!maquina) {
      maquina = await prisma.maquina.create({
        data: {
          serviceTag: m.serviceTag,
          modelo: m.modelo,
          IP: m.IP,
          numeroSerie: m.numeroSerie,
          departamentoId,
        },
      });
      createdMaquinas++;
    }
    const list = maquinaIdsByDept.get(departamentoId) ?? [];
    list.push(maquina.id);
    maquinaIdsByDept.set(departamentoId, list);
  }

  // --- Backfill: ticket CERRADO existente sin fechaCierre ---
  const ticketsSinCierre = await prisma.ticket.findMany({
    where: { status: "CERRADO", fechaCierre: null },
  });
  for (const t of ticketsSinCierre) {
    let fechaCierre = new Date(t.fechaCreacion.getTime() + randomInt(2, 48) * 60 * 60 * 1000);
    if (fechaCierre.getTime() > Date.now()) fechaCierre = new Date();
    await prisma.ticket.update({ where: { id: t.id }, data: { fechaCierre } });
  }

  // --- Tickets ficticios ---
  const catServicios = await prisma.catServicios.findMany();
  const todosLosCreadores = usuarioIdsByRol.USUARIO;
  const todosLosTecnicos = usuarioIdsByRol.TECNICO;

  const STATUS_WEIGHTS: EstadoTicket[] = [
    "CERRADO", "CERRADO", "CERRADO", "CERRADO",
    "ATENDIDO", "ATENDIDO",
    "EN_PROGRESO", "EN_PROGRESO",
    "ABIERTO", "ABIERTO",
  ];

  let createdTickets = 0;
  const TICKET_COUNT = 30;

  for (let i = 0; i < TICKET_COUNT; i++) {
    if (todosLosCreadores.length === 0) break;
    const creadoPorId = pick(todosLosCreadores);
    const creador = await prisma.usuario.findUnique({ where: { id: creadoPorId } });
    if (!creador) continue;

    const servicio = pick(catServicios);
    const status = pick(STATUS_WEIGHTS);
    const disponibles = maquinaIdsByDept.get(creador.departamentoId) ?? [];
    const usarMaquina = disponibles.length > 0 && Math.random() > 0.35;
    const { asunto, descripcion } = pick(TICKET_SUBJECTS);

    const antiguedadDias = randomInt(0, 45);
    const fechaCreacion = daysAgo(antiguedadDias, randomInt(8, 18), randomInt(0, 59));

    let asignadoAId: string | null = null;
    let fechaCierre: Date | null = null;

    if (status !== "ABIERTO" || Math.random() > 0.5) {
      if (todosLosTecnicos.length > 0) asignadoAId = pick(todosLosTecnicos);
    }

    if (status === "CERRADO") {
      if (!asignadoAId && todosLosTecnicos.length > 0) asignadoAId = pick(todosLosTecnicos);
      const horasParaCerrar = randomInt(2, Math.max(3, antiguedadDias * 24));
      fechaCierre = new Date(fechaCreacion.getTime() + horasParaCerrar * 60 * 60 * 1000);
      if (fechaCierre.getTime() > Date.now()) fechaCierre = new Date();
    }

    await prisma.ticket.create({
      data: {
        asunto,
        descripcion,
        status,
        fechaCreacion,
        fechaCierre,
        creadoPor: { connect: { id: creadoPorId } },
        servicio: { connect: { id: servicio.id } },
        ...(asignadoAId && { asignadoA: { connect: { id: asignadoAId } } }),
        ...(usarMaquina && { maquina: { connect: { id: pick(disponibles) } } }),
      },
    });
    createdTickets++;
  }

  console.log("Resumen:");
  console.log(`  Departamentos creados: ${createdDepartamentos}`);
  console.log(`  Usuarios creados: ${createdUsuarios}`);
  console.log(`  Máquinas creadas: ${createdMaquinas}`);
  console.log(`  Tickets creados: ${createdTickets}`);
  console.log(`  Tickets CERRADO sin fechaCierre corregidos: ${ticketsSinCierre.length}`);

  if (createdCredentials.length > 0) {
    console.log("\nCredenciales de usuarios nuevos (todos con la misma contraseña):");
    createdCredentials.forEach((c) => console.log(`  ${c}`));
  } else {
    console.log("\nNo se crearon usuarios nuevos (ya existían por una corrida previa del script).");
  }
}

main()
  .catch((error) => {
    console.error("Error al sembrar datos:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
