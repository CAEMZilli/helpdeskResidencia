import { Router } from "express";
import {
  createCatService,
  getAllCatServices,
  getCatServiceById,
  updateCatService,
  deleteCatService,
} from "../controllers/catServicesControllers";
import { requireAdmin } from "../middleware/roleMiddleware";

const router = Router();

// Gestión: solo administradores. Lectura: cualquier usuario autenticado
// (el usuario elige el servicio al crear un ticket).
router.post("/", requireAdmin, createCatService);
router.get("/", getAllCatServices);
router.get("/:id", getCatServiceById);
router.put("/:id", requireAdmin, updateCatService);
router.delete("/:id", requireAdmin, deleteCatService);

export default router;
