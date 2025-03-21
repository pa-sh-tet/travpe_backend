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
exports.checkEmailAvailability = exports.checkUsernameAvailability = exports.getUserById = exports.getAllUsers = exports.updateUser = exports.getCurrentUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({ error: "Не аутентифицирован" });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, avatar: true }
        });
        if (!user) {
            res.status(404).json({ error: "Пользователь не найден" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});
exports.getCurrentUser = getCurrentUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({ error: "Не аутентифицирован" });
            return;
        }
        const { username, email, avatar } = req.body;
        if (!username && !email && !avatar) {
            res.status(400).json({ error: "Нет данных для обновления" });
            return;
        }
        const user = yield prisma.user.update({
            where: { id: req.user.id },
            data: {
                username,
                email,
                avatar: avatar ||
                    "https://olira174.ru/wp-content/uploads/2019/12/no_avatar.jpg"
            }
        });
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});
exports.updateUser = updateUser;
const getAllUsers = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: { id: true, username: true, avatar: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Ошибка получения пользователей" });
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: Number(id) },
            select: { id: true, username: true, avatar: true }
        });
        if (!user) {
            res.status(404).json({ error: "Пользователь не найден" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Ошибка получения пользователя" });
    }
});
exports.getUserById = getUserById;
const checkUsernameAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { username } });
        res.json({ available: !user });
    }
    catch (error) {
        res.status(500).json({ error: "Ошибка проверки имени пользователя" });
    }
});
exports.checkUsernameAvailability = checkUsernameAvailability;
const checkEmailAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        res.json({ available: !user });
    }
    catch (error) {
        res.status(500).json({ error: "Ошибка проверки email" });
    }
});
exports.checkEmailAvailability = checkEmailAvailability;
