import { Router } from "express";
import {
  createMachine,
  getAllMachines,
  getMachineById,
  updateMachine,
  deleteMachine,
} from "../controllers/machineControllers";

const router = Router();

router.post("/", createMachine);
router.get("/", getAllMachines);
router.get("/:id", getMachineById);
router.put("/:id", updateMachine);
router.delete("/:id", deleteMachine);

export default router;