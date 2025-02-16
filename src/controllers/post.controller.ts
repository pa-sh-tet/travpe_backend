import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
	const { content, image, userId } = req.body;

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
		const posts = await prisma.post.findMany();
		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при получении постов" });
	}
};

export const getPostById = async (req: Request, res: Response) => {
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

export const updatePost = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { content, image } = req.body;

	try {
		const post = await prisma.post.update({
			where: { id: Number(id) },
			data: {
				content,
				image
			}
		});

		res.json(post);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при редактировании поста" });
	}
};

export const deletePost = async (req: Request, res: Response) => {
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
