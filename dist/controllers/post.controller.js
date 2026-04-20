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
exports.getTopLocations = exports.deletePost = exports.updatePost = exports.getPostById = exports.getAllUserPosts = exports.getPosts = exports.createPost = void 0;
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
                latitude: latitude !== null && latitude !== void 0 ? latitude : null,
                longitude: longitude !== null && longitude !== void 0 ? longitude : null
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
    // Проверяем, передан ли id и является ли он числом
    const postId = Number(id);
    if (isNaN(postId)) {
        res.status(400).json({ error: "Некорректный ID поста" });
        return;
    }
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
            where: { id: postId }
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
            updatedData.latitude = latitude !== null && latitude !== void 0 ? latitude : null;
        if (longitude !== undefined)
            updatedData.longitude = longitude !== null && longitude !== void 0 ? longitude : null;
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
// Функция поиска топ 5 самых популярных локаций
const getTopLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany({
            select: {
                location: true,
                latitude: true,
                longitude: true
            }
        });
        // Группировка по городам (в пределах 10-20 км)
        const groupedLocations = {};
        posts.forEach(post => {
            const { location, latitude, longitude } = post;
            if (!location || latitude === null || longitude === null)
                return;
            // Поиск существующего города в пределах 15 км
            let found = false;
            for (const city in groupedLocations) {
                const { lat, lon } = groupedLocations[city];
                const distance = getDistanceFromLatLonInKm(lat, lon, latitude, longitude);
                if (distance < 15) {
                    groupedLocations[city].count++;
                    found = true;
                    break;
                }
            }
            // Если такого города нет, добавляем новый
            if (!found) {
                groupedLocations[location] = {
                    count: 1,
                    lat: latitude,
                    lon: longitude
                };
            }
        });
        // Сортировка по популярности и отбор топ-5
        const sortedLocations = Object.entries(groupedLocations)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([location, { count, lat, lon }]) => ({
            location,
            count,
            latitude: lat,
            longitude: lon
        }));
        res.json(sortedLocations);
    }
    catch (error) {
        console.error("❌ Ошибка в getTopLocations:", error);
        res.status(500).json({ error: "Ошибка при получении популярных локаций" });
    }
});
exports.getTopLocations = getTopLocations;
// Функция расчёта расстояния между координатами (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
