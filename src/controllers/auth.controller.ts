import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface RegisterRequestBody {
	username: string;
	email: string;
	password: string;
	avatar?: string;
}

interface LoginRequestBody {
	email: string;
	password: string;
}

export const register = async (
	req: Request<{}, {}, RegisterRequestBody>,
	res: Response
) => {
	const { username, email, password, avatar } = req.body;

	// Ввел ли пользователь все данные
	if (!username || !email || !password) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
				avatar:
					avatar ||
					"https://olira174.ru/wp-content/uploads/2019/12/no_avatar.jpg"
			}
		});

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: "1d"
		});

		res.status(201).json({
			message:
				"Пользователь успешно зарегистрирован. Авторизация прошла успешно",
			token,
			user
		});
		return;
	} catch (error: any) {
		if (error.code === "P2002") {
			res.status(409).json({ error: "This email has already been registered" });
			return;
		}
		res.status(500).json({ error: "Ошибка при регистрации пользователя" });
	}
};

export const login = async (
	req: Request<{}, {}, LoginRequestBody>,
	res: Response
) => {
	const { email, password } = req.body;

	// Ввел ли пользователь все данные
	if (!email || !password) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		const user = await prisma.user.findUnique({
			where: {
				email
			}
		});

		// Смотрим существует ли пользователь с такими данными
		if (!user) {
			res.status(401).json({ error: "Пользователь с таким email не найден" });
			return;
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		// Смотрим корректен ли пароль
		if (!isPasswordValid) {
			res.status(401).json({ error: "Incorrect password" });
			return;
		}

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: "1d"
		});

		res.json({ message: "Авторизация успешна", token, user });
		return;
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при авторизации пользователя" });
	}
};
