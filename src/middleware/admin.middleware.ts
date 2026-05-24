import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma";

interface AuthRequest extends Request {
	user?: { id: number };
}

export const requireAdmin = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	if (!req.user?.id) {
		res.status(401).json({ error: "Не аутентифицирован" });
		return;
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			select: { role: true }
		});

		if (!user || user.role !== "ADMIN") {
			res.status(403).json({ error: "Недостаточно прав" });
			return;
		}

		next();
	} catch (error) {
		console.error("Ошибка проверки прав:", error);
		res.status(500).json({ error: "Ошибка проверки прав" });
	}
};
