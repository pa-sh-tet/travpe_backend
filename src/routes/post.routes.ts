import { Router } from "express";
import {
	createPost,
	getPosts,
	getAllUserPosts,
	getPostById,
	updatePost,
	deletePost
} from "../controllers/post.controller";
import { authenticateToken } from "../middleware/auth.middleware";

export const postRouter = Router();

postRouter.post("/", authenticateToken, createPost);
postRouter.get("/", getPosts);
postRouter.get("/user/:userId", authenticateToken, getAllUserPosts);
postRouter.get("/:id", getPostById);
postRouter.patch("/:id", authenticateToken, updatePost);
postRouter.delete("/:id", authenticateToken, deletePost);
