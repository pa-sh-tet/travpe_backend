import { Router } from "express";
import {
	createComment,
	getCommentsByPost,
	deleteComment
} from "../controllers/comment.controller";
import { authenticateToken } from "../middleware/auth.middleware";

export const commentRouter = Router();

commentRouter.post("/", authenticateToken, createComment);
commentRouter.get("/:postId", getCommentsByPost);
commentRouter.delete("/:id", authenticateToken, deleteComment);
