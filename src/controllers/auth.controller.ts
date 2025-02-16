import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Маршрут для регистрации пользователя
export const register = async (req: Request, res: Response) => {
	const { username, email, password } = req.body;

	// Ввел ли пользователь все данные
	if (!username || !email || !password) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		// const hashedPassword = await bcrypt.hash(password, 10); // захэшировать пароль

		const user = await prisma.user.create({
			data: {
				username,
				email,
				password: password,
				// password: hashedPassword
				avatar: "https://olira174.ru/wp-content/uploads/2019/12/no_avatar.jpg"
			}
		});
		res.json({ message: "Пользователь успешно зарегистрирован", user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при регистрации пользователя" });
	}
};

// Маршрут для авторизации пользователя
export const login = async (req: Request, res: Response) => {
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

		console.log({ email, password });
		const isPasswordValid = password === user.password;
		// const isPasswordValid = await bcrypt.compare(password, user.password);

		// Смотрим корректен ли пароль
		if (!isPasswordValid) {
			res.status(401).json({ error: "Неверный пароль" });
			return;
		}

		// Создание
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: "1d"
		});

		console.log("Авторизация успешна");
		res.json({ message: "Авторизация успешна", token, user });
		return;
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при авторизации пользователя" });
	}
};
