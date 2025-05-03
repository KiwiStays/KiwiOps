import { Router } from "express";
import { loginAdmin, RegisterAdmin } from "../controllers/AuthController.js";

const router = Router();


router.route("/admin/login").post(loginAdmin);
router.route("/admin/register").post(RegisterAdmin);

export default router;