import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getAdminUsers = async (_req: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				username: true,
				email: true,
				avatar: true,
				role: true,
				isBlocked: true,
				createdAt: true,
				_count: { select: { posts: true } }
			},
			orderBy: { createdAt: "desc" }
		});
		res.json(users);
	} catch (error) {
		console.error("Ошибка получения пользователей:", error);
		res.status(500).json({ error: "Ошибка получения пользователей" });
	}
};

export const blockUser = async (
	req: Request<{ id: string }>,
	res: Response
) => {
	const { id } = req.params;
	try {
		const user = await prisma.user.update({
			where: { id: Number(id) },
			data: { isBlocked: true },
			select: { id: true, username: true, isBlocked: true }
		});
		res.json(user);
	} catch (error) {
		console.error("Ошибка блокировки пользователя:", error);
		res.status(500).json({ error: "Ошибка блокировки пользователя" });
	}
};

export const unblockUser = async (
	req: Request<{ id: string }>,
	res: Response
) => {
	const { id } = req.params;
	try {
		const user = await prisma.user.update({
			where: { id: Number(id) },
			data: { isBlocked: false },
			select: { id: true, username: true, isBlocked: true }
		});
		res.json(user);
	} catch (error) {
		console.error("Ошибка разблокировки пользователя:", error);
		res.status(500).json({ error: "Ошибка разблокировки пользователя" });
	}
};

export const getAdminPosts = async (_req: Request, res: Response) => {
	try {
		const posts = await prisma.post.findMany({
			select: {
				id: true,
				content: true,
				image: true,
				location: true,
				createdAt: true,
				user: { select: { id: true, username: true } }
			},
			orderBy: { createdAt: "desc" }
		});
		res.json(posts);
	} catch (error) {
		console.error("Ошибка получения постов:", error);
		res.status(500).json({ error: "Ошибка получения постов" });
	}
};

export const deleteAnyPost = async (
	req: Request<{ id: string }>,
	res: Response
) => {
	const { id } = req.params;
	try {
		await prisma.post.delete({ where: { id: Number(id) } });
		res.json({ message: "Пост удалён" });
	} catch (error) {
		console.error("Ошибка удаления поста:", error);
		res.status(500).json({ error: "Ошибка удаления поста" });
	}
};

export const getAdminComments = async (_req: Request, res: Response) => {
	try {
		const comments = await prisma.comment.findMany({
			select: {
				id: true,
				content: true,
				createdAt: true,
				user: { select: { id: true, username: true } },
				post: { select: { id: true } }
			},
			orderBy: { createdAt: "desc" }
		});
		res.json(comments);
	} catch (error) {
		console.error("Ошибка получения комментариев:", error);
		res.status(500).json({ error: "Ошибка получения комментариев" });
	}
};

export const deleteAnyComment = async (
	req: Request<{ id: string }>,
	res: Response
) => {
	const { id } = req.params;
	try {
		await prisma.comment.delete({ where: { id: Number(id) } });
		res.json({ message: "Комментарий удалён" });
	} catch (error) {
		console.error("Ошибка удаления комментария:", error);
		res.status(500).json({ error: "Ошибка удаления комментария" });
	}
};
