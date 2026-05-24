import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

interface AuthRequest extends Request {
	user?: { id: number };
}

export const createComment = async (req: AuthRequest, res: Response) => {
	if (!req.user?.id) {
		res.status(401).json({ error: "Не аутентифицирован" });
		return;
	}

	const { content, postId } = req.body;

	if (!content || !postId) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	if (content.length > 280) {
		res
			.status(400)
			.json({ error: "Комментарий не может быть длиннее 280 символов" });
		return;
	}

	try {
		const comment = await prisma.comment.create({
			data: {
				content,
				postId: Number(postId),
				userId: req.user.id
			},
			include: {
				user: {
					select: { id: true, username: true, avatar: true }
				}
			}
		});
		res.status(201).json(comment);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при создании комментария" });
	}
};

export const getCommentsByPost = async (
	req: Request<{ postId: string }>,
	res: Response
) => {
	const { postId } = req.params;

	try {
		const comments = await prisma.comment.findMany({
			where: { postId: Number(postId) },
			include: {
				user: {
					select: { id: true, username: true, avatar: true }
				}
			},
			orderBy: { createdAt: "asc" }
		});
		res.json(comments);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при получении комментариев" });
	}
};

export const deleteComment = async (
	req: AuthRequest & Request<{ id: string }>,
	res: Response
) => {
	if (!req.user?.id) {
		res.status(401).json({ error: "Не аутентифицирован" });
		return;
	}

	const { id } = req.params;

	try {
		const comment = await prisma.comment.findUnique({
			where: { id: Number(id) }
		});

		if (!comment) {
			res.status(404).json({ error: "Комментарий не найден" });
			return;
		}

		if (comment.userId !== req.user.id) {
			res
				.status(403)
				.json({ error: "Нет прав для удаления этого комментария" });
			return;
		}

		await prisma.comment.delete({ where: { id: Number(id) } });
		res.json({ message: "Комментарий успешно удалён" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при удалении комментария" });
	}
};
