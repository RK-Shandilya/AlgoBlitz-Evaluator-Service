import { Router } from "express";
import { pingCheck } from "../../controllers/ping.controller.js";

const v1Router = Router();

v1Router.get("/ping", pingCheck);
export default v1Router;
