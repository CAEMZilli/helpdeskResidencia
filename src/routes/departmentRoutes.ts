import { Router } from "express";
import { createDepartment } from "../controllers/departmentControllers";

const router = Router();

router.post("/", createDepartment);

export default router;