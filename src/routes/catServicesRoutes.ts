import { Router } from "express";
import {
  createCatService,
  getAllCatServices,
  getCatServiceById,
  updateCatService,
  deleteCatService,
} from "../controllers/catServicesControllers";

const router = Router();

router.post("/", createCatService);
router.get("/", getAllCatServices);
router.get("/:id", getCatServiceById);
router.put("/:id", updateCatService);
router.delete("/:id", deleteCatService);

export default router;