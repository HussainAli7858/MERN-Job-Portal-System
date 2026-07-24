import { Router } from "express";
import { create, get, invite, accept } from "../controllers/company.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createCompanySchema, inviteMemberSchema } from "../validators/company.validator.js";

const router = Router();

// All routes require login
router.use(authenticate);

// Only recruiters can create/manage companies
router.post("/", authorize("recruiter"), validate(createCompanySchema), create);
router.get("/me", authorize("recruiter"), get);
router.post("/invite", authorize("recruiter"), validate(inviteMemberSchema), invite);

// Accept invitation — any logged in user
router.get("/accept-invitation", accept);

export default router;