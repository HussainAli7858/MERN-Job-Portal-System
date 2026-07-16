import { Router } from "express";
import { register, login, getMe, logout, refreshToken, verifyEmail } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.post("/refresh-token", refreshToken);

router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);
router.get("/verify-email", verifyEmail);

export default router;