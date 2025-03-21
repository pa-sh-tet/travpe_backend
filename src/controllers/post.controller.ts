import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreatePostBody {
	content: string;
	image: string;
	userId: number;
	location: string;
	latitude: number;
	longitude: number;
}

export const createPost = async (
	req: Request<{}, {}, CreatePostBody>,
	res: Response
) => {
	const { content, image, userId, location, latitude, longitude } = req.body;

	const userIdNumber = Number(userId);
	if (!userIdNumber) {
		res.status(400).json({ error: "Некорректный userId" });
		return;
	}

	if (!content || !image || !userId || !location || !latitude || !longitude) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		const post = await prisma.post.create({
			data: {
				content,
				image,
				userId,
				location,
				latitude: latitude ?? null,
				longitude: longitude ?? null
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

	// Проверяем, передан ли id и является ли он числом
	const postId = Number(id);
	if (isNaN(postId)) {
		res.status(400).json({ error: "Некорректный ID поста" });
		return;
	}

	try {
		const post = await prisma.post.findUnique({
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar: true
					}
				}
			},
			where: { id: postId }
		});

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
	req: Request<
		{ id: string },
		{},
		{
			content?: string;
			image?: string;
			location?: string;
			latitude?: number;
			longitude?: number;
		}
	>,
	res: Response
) => {
	const { id } = req.params;
	const { content, image, location, latitude, longitude } = req.body;

	try {
		const updatedData: {
			content?: string;
			image?: string;
			location?: string;
			latitude?: number;
			longitude?: number;
		} = {};
		if (content !== undefined) updatedData.content = content;
		if (image !== undefined) updatedData.image = image;
		if (location !== undefined) updatedData.location = location;
		if (latitude !== undefined) updatedData.latitude = latitude ?? null;
		if (longitude !== undefined) updatedData.longitude = longitude ?? null;

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

// Функция поиска топ 5 самых популярных локаций
export const getTopLocations = async (req: Request, res: Response) => {
	try {
		const posts = await prisma.post.findMany({
			select: {
				location: true,
				latitude: true,
				longitude: true
			}
		});

		// Группировка по городам (в пределах 10-20 км)
		const groupedLocations: {
			[key: string]: { count: number; lat: number; lon: number };
		} = {};

		posts.forEach(post => {
			const { location, latitude, longitude } = post;
			if (!location || latitude === null || longitude === null) return;

			// Поиск существующего города в пределах 15 км
			let found = false;
			for (const city in groupedLocations) {
				const { lat, lon } = groupedLocations[city];
				const distance = getDistanceFromLatLonInKm(
					lat,
					lon,
					latitude,
					longitude
				);
				if (distance < 15) {
					groupedLocations[city].count++;
					found = true;
					break;
				}
			}

			// Если такого города нет, добавляем новый
			if (!found) {
				groupedLocations[location] = {
					count: 1,
					lat: latitude,
					lon: longitude
				};
			}
		});

		// Сортировка по популярности и отбор топ-5
		const sortedLocations = Object.entries(groupedLocations)
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 5)
			.map(([location, { count }]) => ({ location, count }));

		res.json(sortedLocations);
	} catch (error) {
		console.error("❌ Ошибка в getTopLocations:", error);
		res.status(500).json({ error: "Ошибка при получении популярных локаций" });
	}
};

// Функция расчёта расстояния между координатами (Haversine formula)
function getDistanceFromLatLonInKm(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 6371; // Радиус Земли в км
	const dLat = (lat2 - lat1) * (Math.PI / 180);
	const dLon = (lon2 - lon1) * (Math.PI / 180);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}
