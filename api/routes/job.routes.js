import { Router } from "express";
import {
  create,
  myJobs,
  getOne,
  update,
  remove,
  updateStatus,
} from "../controllers/job.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createJobSchema, updateJobSchema } from "../validators/job.validator.js";

const router = Router();

// All routes below require login + recruiter role
router.use(authenticate, authorize("recruiter"));

router.post("/", validate(createJobSchema), create);
router.get("/my-jobs", myJobs);
router.get("/:id", getOne);
router.put("/:id", validate(updateJobSchema), update);
router.delete("/:id", remove);
router.patch("/:id/status", updateStatus);

export default router;