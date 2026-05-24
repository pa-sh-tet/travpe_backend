import { Router } from "express";
import {
	suggestPlaces,
	suggestPersonalizedPlace
} from "../controllers/gpt.controller";

export const gptRouter = Router();

gptRouter.get("/places", suggestPlaces);
gptRouter.post("/suggest-personalized", suggestPersonalizedPlace);
