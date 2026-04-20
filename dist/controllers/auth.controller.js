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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, avatar } = req.body;
    // Ввел ли пользователь все данные
    if (!username || !email || !password) {
        res.status(400).json({ error: "Все поля обязательны" });
        return;
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                avatar: avatar ||
                    "https://olira174.ru/wp-content/uploads/2019/12/no_avatar.jpg"
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        res.status(201).json({
            message: "Пользователь успешно зарегистрирован. Авторизация прошла успешно",
            token,
            user
        });
        return;
    }
    catch (error) {
        if (error.code === "P2002") {
            res.status(409).json({ error: "This email has already been registered" });
            return;
        }
        res.status(500).json({ error: "Ошибка при регистрации пользователя" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Ввел ли пользователь все данные
    if (!email || !password) {
        res.status(400).json({ error: "Все поля обязательны" });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email
            }
        });
        // Смотрим существует ли пользователь с такими данными
        if (!user) {
            res.status(401).json({ error: "Пользователь с таким email не найден" });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        // Смотрим корректен ли пароль
        if (!isPasswordValid) {
            res.status(401).json({ error: "Incorrect password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        res.json({ message: "Авторизация успешна", token, user });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при авторизации пользователя" });
    }
});
exports.login = login;
