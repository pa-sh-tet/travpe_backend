import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

interface AuthRequest extends Request {
	user?: { id: number };
}

export const authenticateToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		res.status(401).json({ error: "Нет доступа (токен отсутствует)" });
		return;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
			userId: number;
		};

		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: { id: true, isBlocked: true }
		});

		if (!user) {
			res.status(403).json({ error: "Пользователь не найден" });
			return;
		}

		if (user.isBlocked) {
			res.status(403).json({ error: "Ваш аккаунт заблокирован" });
			return;
		}

		req.user = { id: decoded.userId };
		next();
	} catch (error) {
		res.status(403).json({ error: "Недействительный токен" });
		return;
	}
};
