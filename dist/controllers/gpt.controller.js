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
exports.suggestPlaces = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Создаём HTTPS агент с отключенной проверкой сертификатов
const httpsAgent = new https_1.default.Agent({
    rejectUnauthorized: false // Отключает проверку SSL-сертификата
});
let token = ""; // Тут мы будем хранить access token
let tokenExpires = 0; // А здесь — время истечения токена
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        if (token && Date.now() < tokenExpires)
            return token;
        const response = yield axios_1.default.post("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", // Адрес получения токена
        new URLSearchParams({ scope: "GIGACHAT_API_PERS" }), // Обязательный параметр scope
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded", // Как требует API
                Accept: "application/json",
                RqUID: crypto.randomUUID(), // Уникальный ID запроса (можно любой)
                Authorization: `Basic ${process.env.GIGACHAT_AUTH_KEY}` // Ключ авторизации из .env
            },
            httpsAgent // Используем наш агент, чтобы игнорировать SSL-проверку
        });
        token = response.data.access_token;
        tokenExpires = Date.now() + (response.data.expires_in - 60) * 1000; // минус 60 сек. — запас
        return token;
    });
}
const suggestPlaces = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const accessToken = yield getAccessToken(); // получаем токен
        const response = yield axios_1.default.post("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", // Эндпоинт генерации текста
        {
            model: "GigaChat-Pro", // Модель (доступная модель из документации)
            messages: [
                {
                    role: "user",
                    content: "Предложи интересное место для посещения в России" // Вот это и пойдёт в чат
                }
            ]
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Обязательный access token
                "Content-Type": "application/json"
            },
            httpsAgent // Всё так же — игнорируем SSL
        });
        const result = (_c = (_b = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content; // Парсим текст ответа
        res.json({ place: result !== null && result !== void 0 ? result : "Не удалось получить ответ" }); // Отправляем клиенту
    }
    catch (e) {
        console.error("GigaChat error:", (_e = (_d = e === null || e === void 0 ? void 0 : e.response) === null || _d === void 0 ? void 0 : _d.data) !== null && _e !== void 0 ? _e : e.message); // Логируем ошибку
        res.status(500).json({ error: "Ошибка при обращении к GigaChat" }); // Отдаём ошибку клиенту
    }
});
exports.suggestPlaces = suggestPlaces;
