import { Router } from "express";
import { suggestPlaces } from "../controllers/gpt.controller";

export const gptRouter = Router();

gptRouter.get("/places", suggestPlaces);
