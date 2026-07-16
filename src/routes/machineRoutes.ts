import { Router } from "express";
import {
  createMachine,
  getAllMachines,
  getMachineById,
  updateMachine,
  deleteMachine,
} from "../controllers/machineControllers";
import { requireAdmin } from "../middleware/roleMiddleware";

const router = Router();

// Gestión: solo administradores. Lectura: cualquier usuario autenticado
// (el usuario elige su equipo al crear un ticket).
router.post("/", requireAdmin, createMachine);
router.get("/", getAllMachines);
router.get("/:id", getMachineById);
router.put("/:id", requireAdmin, updateMachine);
router.delete("/:id", requireAdmin, deleteMachine);

export default router;
