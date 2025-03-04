import { Router } from "express";
import { pingCheck } from "../../controllers/ping.controller.js";
import submissionRouter from "./submission.route.js";

const v1Router = Router();
v1Router.use("/submissions", submissionRouter);

v1Router.get("/ping", pingCheck);
export default v1Router;
