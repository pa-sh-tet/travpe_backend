import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UserPayload {
	id: number;
}

interface AuthRequest extends Request {
	user?: UserPayload;
}

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user?.id) {
			res.status(401).json({ error: "Не аутентифицирован" });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			select: { id: true, username: true, email: true, avatar: true }
		});

		if (!user) {
			res.status(404).json({ error: "Пользователь не найден" });
			return;
		}

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка сервера" });
	}
};

export const updateUser = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user?.id) {
			res.status(401).json({ error: "Не аутентифицирован" });
			return;
		}

		const { username, email, avatar } = req.body;

		if (!username && !email && !avatar) {
			res.status(400).json({ error: "Нет данных для обновления" });
			return;
		}

		const user = await prisma.user.update({
			where: { id: req.user.id },
			data: {
				username,
				email,
				avatar:
					avatar ||
					"https://olira174.ru/wp-content/uploads/2019/12/no_avatar.jpg"
			}
		});

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка сервера" });
	}
};

export const getAllUsers = async (_: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany({
			select: { id: true, username: true, avatar: true }
		});
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: "Ошибка получения пользователей" });
	}
};

export const getUserById = async (
	req: Request<{ id: string }>,
	res: Response
) => {
	const { id } = req.params;
	try {
		const user = await prisma.user.findUnique({
			where: { id: Number(id) },
			select: { id: true, username: true, avatar: true }
		});
		if (!user) {
			res.status(404).json({ error: "Пользователь не найден" });
			return;
		}
		res.json(user);
	} catch (error) {
		res.status(500).json({ error: "Ошибка получения пользователя" });
	}
};

export const checkUsernameAvailability = async (
	req: Request<{ username: string }>,
	res: Response
) => {
	const { username } = req.body;
	try {
		const user = await prisma.user.findUnique({ where: { username } });
		res.json({ available: !user });
	} catch (error) {
		res.status(500).json({ error: "Ошибка проверки имени пользователя" });
	}
};

export const checkEmailAvailability = async (
	req: Request<{ email: string }>,
	res: Response
) => {
	const { email } = req.body;
	try {
		const user = await prisma.user.findUnique({ where: { email } });
		res.json({ available: !user });
	} catch (error) {
		res.status(500).json({ error: "Ошибка проверки email" });
	}
};
