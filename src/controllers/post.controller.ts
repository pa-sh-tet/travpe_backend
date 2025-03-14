import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreatePostBody {
	content: string;
	image: string;
	userId: number;
}

export const createPost = async (
	req: Request<{}, {}, CreatePostBody>,
	res: Response
) => {
	const { content, image, userId } = req.body;

	const userIdNumber = Number(userId);
	if (!userIdNumber) {
		res.status(400).json({ error: "Некорректный userId" });
		return;
	}

	if (!content || !image || !userId) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		const post = await prisma.post.create({
			data: {
				content,
				image,
				userId
			}
		});
		res.json({ message: "Пост успешно создан", post });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при создании поста" });
	}
};

export const getPosts = async (req: Request, res: Response) => {
	try {
		const posts = await prisma.post.findMany({
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar: true
					}
				}
			},
			orderBy: { createdAt: "desc" }
		});
		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при получении постов" });
	}
};

export const getAllUserPosts = async (
	req: Request<{ userId: string }>,
	res: Response
) => {
	const { userId } = req.params;

	try {
		const posts = await prisma.post.findMany({
			where: { userId: Number(userId) },
			orderBy: { createdAt: "desc" }
		});

		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при получении постов пользователя" });
	}
};

export const getPostById = async (
	req: Request<{ id: string }>,
	res: Response
) => {
	const { id } = req.params;

	try {
		const post = await prisma.post.findUnique({ where: { id: Number(id) } });

		if (!post) {
			res.status(404).json({ error: "Пост не найден" });
			return;
		}

		res.json(post);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при получении поста" });
	}
};

export const updatePost = async (
	// первый {} - это req.params(из URL), второй {} - это req.query , третий {} - это req.body
	req: Request<{ id: string }, {}, { content?: string; image?: string }>,
	res: Response
) => {
	const { id } = req.params;
	const { content, image } = req.body;

	try {
		const updatedData: { content?: string; image?: string } = {};
		if (content !== undefined) updatedData.content = content;
		if (image !== undefined) updatedData.image = image;

		const post = await prisma.post.update({
			where: { id: Number(id) },
			data: updatedData,
			include: { user: true }
		});

		res.json(post);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при редактировании поста" });
	}
};

export const deletePost = async (
	req: Request<{ id: string }>,
	res: Response
) => {
	const { id } = req.params;

	try {
		await prisma.post.delete({
			where: { id: Number(id) }
		});
		res.json({ message: "Пост успешно удален" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при удалении поста" });
	}
};
