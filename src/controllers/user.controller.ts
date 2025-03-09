import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
	user?: { id: number };
}

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user || !req.user.id) {
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
		if (!req.user || !req.user.id) {
			res.status(401).json({ error: "Не аутентифицирован" });
			return;
		}

		const { username, email, avatar } = req.body;

		const user = await prisma.user.update({
			where: { id: req.user.id },
			data: { username, email, avatar }
		});

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка сервера" });
	}
};

export const getAllUsers = async (_: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany();
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: "Ошибка получения пользователей" });
	}
};

export const getUserById = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const user = await prisma.user.findUnique({ where: { id: Number(id) } });
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
	req: Request,
	res: Response
) => {
	const { username } = req.body;
	try {
		const user = await prisma.user.findUnique({ where: { username } });
		if (user) {
			res.json(false);
		} else {
			res.json(true);
		}
	} catch (error) {
		res
			.status(500)
			.json({ error: "Ошибка проверки доступности имени пользователя" });
	}
};

export const checkEmailAvailability = async (req: Request, res: Response) => {
	const { email } = req.body;
	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (user) {
			res.json(false);
		} else {
			res.json(true);
		}
	} catch (error) {
		res
			.status(500)
			.json({ error: "Ошибка проверки доступности имени пользователя" });
	}
};
