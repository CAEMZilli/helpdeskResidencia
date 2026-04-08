import { Router } from "express";
import { createDepartment,
        deleteDepartment,
 } from "../controllers/departmentControllers";

const router = Router();


router.post("/", createDepartment);
router.delete("/:id", deleteDepartment);

export default router;