import { Router } from "express";
import { createDepartment,
        deleteDepartment,
        findDepartmentById,
        findAllDepartments,
        updateDepartment,
 } from "../controllers/departmentControllers";
import { requireAdmin } from "../middleware/roleMiddleware";

const router = Router();

// Gestión: solo administradores. Lectura: cualquier usuario autenticado
// (los selects de departamento se usan en varias pantallas por rol).
router.post("/", requireAdmin, createDepartment);
router.delete("/:id", requireAdmin, deleteDepartment);
router.put("/:id", requireAdmin, updateDepartment);
router.get("/:id", findDepartmentById);
router.get("/", findAllDepartments);

export default router;
