import { Router } from "express";
import {
	createPost,
	getPosts,
	getAllUserPosts,
	getPostById,
	updatePost,
	deletePost
} from "../controllers/post.controller";

export const postRouter = Router();

postRouter.post("/", createPost);
postRouter.get("/", getPosts);
postRouter.get("/user/:userId", getAllUserPosts);
postRouter.get("/:id", getPostById);
postRouter.put("/:id", updatePost);
postRouter.delete("/:id", deletePost);
