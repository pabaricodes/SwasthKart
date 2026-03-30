import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as profileController from "../controllers/profileController";

const router = Router();

router.use(requireAuth);

router.get("/me", profileController.getProfile);
router.put("/me", profileController.updateProfile);
router.get("/me/addresses", profileController.listAddresses);
router.get("/me/addresses/:id", profileController.getAddress);
router.post("/me/addresses", profileController.createAddress);
router.put("/me/addresses/:id", profileController.updateAddress);
router.delete("/me/addresses/:id", profileController.deleteAddress);
router.put("/me/addresses/:id/default", profileController.setDefaultAddress);

export default router;
