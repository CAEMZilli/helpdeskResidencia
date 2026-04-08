import { Router } from "express";
import { createDepartment,
        deleteDepartment,
        findDepartmentById,
 } from "../controllers/departmentControllers";

const router = Router();


router.post("/", createDepartment);
router.delete("/:id", deleteDepartment);
router.get("/:id", findDepartmentById);

export default router;