import { Request, Response } from "express";
import {
  createSubmissionDto,
  createSubmissionZodSchema,
} from "../dtos/createSubmission.dto.js";

export function addSubmission(req: Request, res: Response) {
  const result = createSubmissionZodSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
      message: "Invalid submission data",
    });
    return;
  }
  const submissionDto = result.data as createSubmissionDto;

  res.status(201).json({
    success: true,
    error: {},
    message: "Successfully collected the submission",
    data: submissionDto,
  });
}
