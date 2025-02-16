import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
// TODO допилить хэширование
// import bcrypt from "bcrypt";

import { authRouter } from "./routes/auth.routes";
import { postRouter } from "./routes/post.routes";
import { userRouter } from "./routes/user.routes";
import { likeRouter } from "./routes/like.routes";

dotenv.config();

const PORT = process.env.PORT || 5000;

export const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// API маршруты
app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/users", userRouter);
app.use("/likes", likeRouter);

app.listen(PORT, () => {
	console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
