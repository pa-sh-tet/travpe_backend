import axios from "axios";
import https from "https";
import dotenv from "dotenv";
dotenv.config();

// Создаём HTTPS агент с отключенной проверкой сертификатов
const httpsAgent = new https.Agent({
	rejectUnauthorized: false // Отключает проверку SSL-сертификата
});

let token = ""; // Тут мы будем хранить access token
let tokenExpires = 0; // А здесь — время истечения токена

async function getAccessToken() {
	if (token && Date.now() < tokenExpires) return token;

	const response = await axios.post(
		"https://ngw.devices.sberbank.ru:9443/api/v2/oauth", // Адрес получения токена
		new URLSearchParams({ scope: "GIGACHAT_API_PERS" }), // Обязательный параметр scope
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded", // Как требует API
				Accept: "application/json",
				RqUID: crypto.randomUUID(), // Уникальный ID запроса (можно любой)
				Authorization: `Basic ${process.env.GIGACHAT_AUTH_KEY}` // Ключ авторизации из .env
			},
			httpsAgent // Используем наш агент, чтобы игнорировать SSL-проверку
		}
	);

	token = response.data.access_token;
	tokenExpires = Date.now() + (response.data.expires_in - 60) * 1000; // минус 60 сек. — запас
	return token;
}

export const suggestPlaces = async (_req: any, res: any) => {
	try {
		const accessToken = await getAccessToken(); // получаем токен

		const response = await axios.post(
			"https://gigachat.devices.sberbank.ru/api/v1/chat/completions", // Эндпоинт генерации текста
			{
				model: "GigaChat-Pro", // Модель (доступная модель из документации)
				messages: [
					{
						role: "user",
						content: "Предложи интересное место для посещения в России" // Вот это и пойдёт в чат
					}
				]
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`, // Обязательный access token
					"Content-Type": "application/json"
				},
				httpsAgent // Всё так же — игнорируем SSL
			}
		);

		const result = response.data.choices?.[0]?.message?.content; // Парсим текст ответа
		res.json({ place: result ?? "Не удалось получить ответ" }); // Отправляем клиенту
	} catch (e: any) {
		console.error("GigaChat error:", e?.response?.data ?? e.message); // Логируем ошибку
		res.status(500).json({ error: "Ошибка при обращении к GigaChat" }); // Отдаём ошибку клиенту
	}
};
