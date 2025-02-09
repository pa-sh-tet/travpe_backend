import express from "express"; // основной веб-фреймворк
import cors from "cors"; // для управления CORS (разрешение запросов с других доменов)
import helmet from "helmet"; // защита от уязвимостей
import morgan from "morgan"; // логирование запросов в консоль
import dotenv from "dotenv"; // управление переменными окружения
import { PrismaClient } from "@prisma/client"; // импортируем PrismaClient

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const prisma = new PrismaClient();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Тестовый маршрут для добавления пользователя в базу данных
app.post("/user", async (req, res) => {
	const { name, email } = req.body;

	try {
		// Создание нового пользователя с помощью Prisma
		const user = await prisma.user.create({
			data: {
				name,
				email
			}
		});
		res.json(user);
	} catch (error) {
		res
			.status(500)
			.json({ error: "Something went wrong while creating user." });
	}
});

// Тестовый маршрут для получения всех пользователей
app.get("/users", async (req, res) => {
	try {
		// Получение всех пользователей с помощью Prisma
		const users = await prisma.user.findMany();
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch users." });
	}
});

app.get("/", (req, res) => {
	res.send("Server is running! 🚀");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
