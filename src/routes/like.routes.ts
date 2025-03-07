import { Router } from "express";
import {
	likePost,
	getLikesByPost,
	unlikePost
} from "../controllers/like.controller";
import { authenticateToken } from "../middleware/auth.middleware";

export const likeRouter = Router();

likeRouter.post("/", authenticateToken, likePost);
likeRouter.get("/:postId", getLikesByPost);
likeRouter.delete("/:id", authenticateToken, unlikePost);
