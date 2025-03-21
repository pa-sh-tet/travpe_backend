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
exports.deletePost = exports.updatePost = exports.getPostById = exports.getAllUserPosts = exports.getPosts = exports.createPost = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, image, userId, location, latitude, longitude } = req.body;
    const userIdNumber = Number(userId);
    if (!userIdNumber) {
        res.status(400).json({ error: "Некорректный userId" });
        return;
    }
    if (!content || !image || !userId || !location || !latitude || !longitude) {
        res.status(400).json({ error: "Все поля обязательны" });
        return;
    }
    try {
        const post = yield prisma.post.create({
            data: {
                content,
                image,
                userId,
                location,
                latitude,
                longitude
            }
        });
        res.json({ message: "Пост успешно создан", post });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при создании поста" });
    }
});
exports.createPost = createPost;
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при получении постов" });
    }
});
exports.getPosts = getPosts;
const getAllUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const posts = yield prisma.post.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: "desc" }
        });
        res.json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при получении постов пользователя" });
    }
});
exports.getAllUserPosts = getAllUserPosts;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const post = yield prisma.post.findUnique({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            where: { id: Number(id) }
        });
        if (!post) {
            res.status(404).json({ error: "Пост не найден" });
            return;
        }
        res.json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при получении поста" });
    }
});
exports.getPostById = getPostById;
const updatePost = (
// первый {} - это req.params(из URL), второй {} - это req.query , третий {} - это req.body
req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { content, image, location, latitude, longitude } = req.body;
    try {
        const updatedData = {};
        if (content !== undefined)
            updatedData.content = content;
        if (image !== undefined)
            updatedData.image = image;
        if (location !== undefined)
            updatedData.location = location;
        if (latitude !== undefined)
            updatedData.latitude = latitude;
        if (longitude !== undefined)
            updatedData.longitude = longitude;
        const post = yield prisma.post.update({
            where: { id: Number(id) },
            data: updatedData,
            include: { user: true }
        });
        res.json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при редактировании поста" });
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.post.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Пост успешно удален" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при удалении поста" });
    }
});
exports.deletePost = deletePost;
