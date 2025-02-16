import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
	user?: { id: number };
}

export const authenticateToken = (
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

		req.user = { id: decoded.userId };
		next();
	} catch (error) {
		res.status(403).json({ error: "Недействительный токен" });
		return;
	}
};
