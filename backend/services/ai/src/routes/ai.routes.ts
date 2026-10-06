import express from "express"
import { getAIAnalytics } from "../controllers/ai.controller.js";

const aiRouter = express.Router();

aiRouter.post(
  "/analytics",
  getAIAnalytics
);

export default aiRouter;