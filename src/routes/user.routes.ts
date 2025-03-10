import { Router } from "express";
import {
	getCurrentUser,
	getAllUsers,
	getUserById,
	updateUser,
	checkUsernameAvailability,
	checkEmailAvailability
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

export const userRouter = Router();

userRouter.get("/me", authenticateToken, getCurrentUser);
userRouter.put("/me", authenticateToken, updateUser);
userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/check-username", checkUsernameAvailability);
userRouter.post("/check-email", checkEmailAvailability);
