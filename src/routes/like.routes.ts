import { Router } from "express";
import {
	likePost,
	getLikesByPost,
	unlikePost
} from "../controllers/like.controller";

export const likeRouter = Router();

likeRouter.post("/", likePost);
likeRouter.get("/:postId", getLikesByPost);
likeRouter.delete("/:id", unlikePost);
