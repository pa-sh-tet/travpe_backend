import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const likePost = async (req: Request, res: Response) => {
	const { userId, postId } = req.body;

	if (!userId || !postId) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		const like = await prisma.like.create({
			data: {
				userId,
				postId
			}
		});
		res.json(like);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при добавлении лайка" });
	}
};

export const getLikesByPost = async (req: Request, res: Response) => {
	const { postId } = req.body;

	if (!postId) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		const likes = await prisma.like.findMany({ where: { postId } });
		res.json(likes);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при получении лайков" });
	}
};

export const unlikePost = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		await prisma.like.delete({
			where: { id: Number(id) }
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при удалении лайка" });
	}
};
