import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LikeRequestBody {
	userId: number;
	postId: number;
}

export const likePost = async (
	req: Request<{}, {}, LikeRequestBody>,
	res: Response
) => {
	const { userId, postId } = req.body;

	if (!userId || !postId) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		// Проверяем, не поставил ли пользователь уже лайк на этот пост
		const existingLike = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId,
					postId
				}
			}
		});
		// const existingLike = await prisma.like.findFirst({
		// 	where: {
		// 			userId: userId,
		// 			postId: postId
		// 	}
		// });
		if (existingLike) {
			res.status(400).json({ error: "Лайк уже поставлен" });
			return;
		}
		const like = await prisma.like.create({
			data: { userId: userId, postId: postId }
		});
		res.json(like);
	} catch (error) {
		console.error("Ошибка при добавлении лайка:", error);
		res.status(500).json({ error: "Ошибка при добавлении лайка" });
	}
};

export const getLikesByPost = async (
	// тип string, потому что id — это часть URL запроса (.../api/likes/:postId)
	req: Request<{ postId: string }>,
	res: Response
) => {
	const { postId } = req.params;
	if (!postId) {
		res.status(400).json({ error: "Не указан postId" });
		return;
	}
	try {
		const likes = await prisma.like.findMany({
			// типизируем в number
			where: { postId: Number(postId) }
		});
		res.json(likes);
	} catch (error) {
		console.error("Ошибка при получении лайков:", error);
		res.status(500).json({ error: "Ошибка при получении лайков" });
	}
};

export const unlikePost = async (
	req: Request<{ id: string }>,
	res: Response
) => {
	const { id } = req.params;
	try {
		await prisma.like.delete({
			where: { id: Number(id) }
		});
		res.json({ message: "Лайк успешно удален" });
	} catch (error) {
		console.error("Ошибка при удалении лайка:", error);
		res.status(500).json({ error: "Ошибка при удалении лайка" });
	}
};
