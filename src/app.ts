import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

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

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);
app.use("/api/likes", likeRouter);

app.listen(PORT, () => {
	console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
