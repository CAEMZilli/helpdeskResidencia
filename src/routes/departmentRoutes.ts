import { Router } from "express";
import { createDepartment,
        deleteDepartment,
        findDepartmentById,
        findAllDepartments,
 } from "../controllers/departmentControllers";

const router = Router();


router.post("/", createDepartment);
router.delete("/:id", deleteDepartment);
router.get("/:id", findDepartmentById);
router.get("/", findAllDepartments);

export default router;