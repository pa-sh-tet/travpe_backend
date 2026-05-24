import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import {
	getAdminUsers,
	blockUser,
	unblockUser,
	getAdminPosts,
	deleteAnyPost,
	getAdminComments,
	deleteAnyComment
} from "../controllers/admin.controller";

export const adminRouter = Router();

adminRouter.use(authenticateToken, requireAdmin);

adminRouter.get("/users", getAdminUsers);
adminRouter.patch("/users/:id/block", blockUser);
adminRouter.patch("/users/:id/unblock", unblockUser);
adminRouter.get("/posts", getAdminPosts);
adminRouter.delete("/posts/:id", deleteAnyPost);
adminRouter.get("/comments", getAdminComments);
adminRouter.delete("/comments/:id", deleteAnyComment);
