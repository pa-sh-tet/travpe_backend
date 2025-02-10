import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Маршрут для регистрации пользователя
app.post("/auth/register", async (req, res) => {
	const { username, email, password } = req.body;

	// Ввел ли пользователь все данные
	if (!username || !email || !password) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10); // захэшировать пароль

		const user = await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword
			}
		});
		res.json({ message: "Пользователь успешно зарегистрирован", user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при регистрации пользователя" });
	}
});

// Маршрут для авторизации пользователя
app.post("/auth/login", async (req, res) => {
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
			res.status(401).json({ error: "Неверный пароль" });
		}

		// Создание
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: "1d"
		});

		res.json({ message: "Авторизация успешна", token });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при авторизации пользователя" });
	}
});

// Проверка подключения к БД
app.get("/users", async (req, res) => {
	try {
		const users = await prisma.user.findMany();
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: "Ошибка при получении пользователей" });
	}
});

app.post("/posts", async (req, res) => {
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
});

app.get("/posts", async (req, res) => {
	try {
		const posts = await prisma.post.findMany();
		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при получении постов" });
	}
});

app.get("/posts/:id", async (req, res) => {
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
});

app.put("/posts/:id", async (req, res) => {
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
});

app.delete("/posts/:id", async (req, res) => {
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
});

app.post("/likes", async (req, res) => {
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
});

app.get("/likes/:postId", async (req, res) => {
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
});

app.delete("/likes/:id", async (req, res) => {
	const { id } = req.params;

	try {
		await prisma.like.delete({
			where: { id: Number(id) }
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Ошибка при удалении лайка" });
	}
});

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
