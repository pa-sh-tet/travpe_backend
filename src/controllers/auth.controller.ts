import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import { prisma } from "../utils/prisma";

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

	if (!email || !password) {
		res.status(400).json({ error: "Все поля обязательны" });
		return;
	}

	try {
		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			res.status(401).json({ error: "Пользователь с таким email не найден" });
			return;
		}

		// OAuth-пользователь без пароля
		if (!user.password) {
			res.status(401).json({
				error: "Этот аккаунт создан через Яндекс ID. Войдите через Яндекс."
			});
			return;
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

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

// ── Yandex OAuth ──────────────────────────────────────────────────────────────

export const yandexLogin = (_req: Request, res: Response) => {
	const params = new URLSearchParams({
		response_type: "code",
		client_id: process.env.YANDEX_CLIENT_ID!,
		redirect_uri: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/yandex/callback`
	});
	res.redirect(`https://oauth.yandex.ru/authorize?${params}`);
};

export const yandexCallback = async (req: Request, res: Response) => {
	const { code } = req.query;
	const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
	const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

	if (!code) {
		res.redirect(`${frontendUrl}/login?error=oauth_failed`);
		return;
	}

	try {
		// 1. Обменять code на access_token
		const tokenRes = await axios.post(
			"https://oauth.yandex.ru/token",
			new URLSearchParams({
				grant_type: "authorization_code",
				code: code as string,
				client_id: process.env.YANDEX_CLIENT_ID!,
				client_secret: process.env.YANDEX_CLIENT_SECRET!,
				redirect_uri: `${backendUrl}/api/auth/yandex/callback`
			}),
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } }
		);

		const accessToken: string = tokenRes.data.access_token;

		// 2. Получить данные пользователя с Яндекса
		const userRes = await axios.get(
			"https://login.yandex.ru/info?format=json",
			{ headers: { Authorization: `OAuth ${accessToken}` } }
		);

		const {
			id: yandexId,
			login,
			real_name,
			default_email,
			default_avatar_id
		} = userRes.data;

		const yandexIdStr = String(yandexId);
		const email = default_email || `${login}@yandex.ru`;
		const avatar = default_avatar_id
			? `https://avatars.yandex.net/get-yapic/${default_avatar_id}/islands-200`
			: "https://olira174.ru/wp-content/uploads/2019/12/no_avatar.jpg";

		// 3. Найти или создать пользователя
		let user = await prisma.user.findUnique({
			where: { yandexId: yandexIdStr }
		});

		if (!user) {
			// Проверяем, есть ли уже аккаунт с таким email
			const existingByEmail = await prisma.user.findUnique({
				where: { email }
			});

			if (existingByEmail) {
				// Привязываем yandexId к существующему аккаунту
				user = await prisma.user.update({
					where: { id: existingByEmail.id },
					data: { yandexId: yandexIdStr }
				});
			} else {
				// Создаём новый аккаунт
				let username = real_name || login || `user_${yandexIdStr}`;

				// Обрабатываем коллизию имён
				const existingUsername = await prisma.user.findUnique({
					where: { username }
				});
				if (existingUsername) {
					username = `${username}_${Math.floor(Math.random() * 9000 + 1000)}`;
				}

				user = await prisma.user.create({
					data: {
						username,
						email,
						password: null,
						avatar,
						yandexId: yandexIdStr
					}
				});
			}
		}

		// 4. Выдать JWT и редиректнуть на фронтенд
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: "1d"
		});

		res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
	} catch (error: any) {
		console.error("Yandex OAuth error:", error?.response?.data ?? error.message);
		res.redirect(`${frontendUrl}/login?error=oauth_failed`);
	}
};
