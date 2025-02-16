import { Router } from "express";
import {
	getCurrentUser,
	getAllUsers,
	getUserById
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

export const userRouter = Router();

userRouter.get("/me", authenticateToken, getCurrentUser);
userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
