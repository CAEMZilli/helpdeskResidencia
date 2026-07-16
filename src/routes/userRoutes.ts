import { Router } from "express";
import { createUser,
        getAllUsers,
        getUserById,
        updateUser,
        deleteUser,
 } from "../controllers/userControllers";
import { requireAdmin } from "../middleware/roleMiddleware";

const router = Router();

// Gestión de usuarios: solo administradores.
router.post("/", requireAdmin, createUser);
router.get("/", requireAdmin, getAllUsers);
router.delete("/:id", requireAdmin, deleteUser);

// Consulta y edición de un usuario: el propio usuario o un administrador
// (la validación self-or-admin se hace dentro del controlador).
router.get("/:id", getUserById);
router.put("/:id", updateUser);

export default router
