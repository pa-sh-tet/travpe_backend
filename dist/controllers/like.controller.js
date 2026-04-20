"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikePost = exports.getLikesByPost = exports.likePost = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, postId } = req.body;
    if (!userId || !postId) {
        res.status(400).json({ error: "Все поля обязательны" });
        return;
    }
    try {
        // Проверяем, не поставил ли пользователь уже лайк на этот пост
        const existingLike = yield prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });
        if (existingLike) {
            res.status(400).json({ error: "Лайк уже поставлен" });
            return;
        }
        const like = yield prisma.like.create({
            data: { userId: userId, postId: postId }
        });
        res.json(like);
    }
    catch (error) {
        console.error("Ошибка при добавлении лайка:", error);
        res.status(500).json({ error: "Ошибка при добавлении лайка" });
    }
});
exports.likePost = likePost;
const getLikesByPost = (
// тип string, потому что id — это часть URL запроса (.../api/likes/:postId)
req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    if (!postId) {
        res.status(400).json({ error: "Не указан postId" });
        return;
    }
    try {
        const likes = yield prisma.like.findMany({
            // типизируем в number
            where: { postId: Number(postId) }
        });
        res.json(likes);
    }
    catch (error) {
        console.error("Ошибка при получении лайков:", error);
        res.status(500).json({ error: "Ошибка при получении лайков" });
    }
});
exports.getLikesByPost = getLikesByPost;
const unlikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.like.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Лайк успешно удален" });
    }
    catch (error) {
        console.error("Ошибка при удалении лайка:", error);
        res.status(500).json({ error: "Ошибка при удалении лайка" });
    }
});
exports.unlikePost = unlikePost;
