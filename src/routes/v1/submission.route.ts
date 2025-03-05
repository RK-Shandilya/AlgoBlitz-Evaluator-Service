import express from "express";

import { addSubmission } from "../../controllers/submission.controller.js";
import { createSubmissionZodSchema } from "../../dtos/createSubmission.dto.js";
import { validate } from "../../validators/zod.validator.js";

const submissionRouter = express.Router();

submissionRouter.post("/", validate(createSubmissionZodSchema), addSubmission);

export default submissionRouter;
