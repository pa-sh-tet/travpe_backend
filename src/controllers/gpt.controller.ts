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

export const suggestPersonalizedPlace = async (req: any, res: any) => {
	try {
		const {
			locations,
			language
		}: { locations?: string[]; language?: string } = req.body;
		const accessToken = await getAccessToken();

		const hasLocations = Array.isArray(locations) && locations.length > 0;
		const locationList = hasLocations ? locations!.join(", ") : null;
		const isEnglish = language === "en";

		let prompt: string;

		if (isEnglish) {
			prompt = hasLocations
				? `A traveler has already visited these places: ${locationList}.
Based on their route and interests, suggest one next destination anywhere in the world - something they haven't seen yet. Something unexpected and inspiring.

A short answer is needed for a website card.

Requirements:
- no markdown
- no asterisks
- no lists
- no em dashes (use en dashes)
- no quotation marks
- no introductory phrases or explanations
- natural, lively, human style. Like posts on travel social media.
- no more than 250 characters in the description
- respond in English`
				: `Suggest one interesting travel destination anywhere in the world. Something original, not obvious.

A short answer is needed for a website card.

Requirements:
- no markdown
- no asterisks
- no lists
- no em dashes (use en dashes)
- no quotation marks
- no introductory phrases or explanations
- natural, lively, human style. Like posts on travel social media.
- no more than 250 characters in the description
- respond in English`;
		} else {
			prompt = hasLocations
				? `Путешественник уже побывал в этих местах: ${locationList}.
Учитывая его маршрут и интересы, предложи одно следующее место для посещения в любой точке мира - что-то, чего он ещё не видел. Нужно что-то неожиданное и вдохновляющее.

Нужен короткий ответ для карточки на сайте.

Требования:
- без markdown
- без звёздочек
- без списков
- без длинных тире (используй средние тире)
- без кавычек
- без вводных фраз и пояснений
- естественный, живой, человеческий стиль. Как пример - тексты в соцсетях aviasales.
- не более 250 символов в описании
- отвечай на русском языке`
				: `Предложи одно интересное место для путешествия в любой точке мира. Нужно что-то оригинальное, не банальное.

Нужен короткий ответ для карточки на сайте.

Требования:
- без markdown
- без звёздочек
- без списков
- без длинных тире (используй средние тире)
- без кавычек
- без вводных фраз и пояснений
- естественный, живой, человеческий стиль. Как пример - тексты в соцсетях aviasales.
- не более 250 символов в описании
- отвечай на русском языке`;
		}

		const response = await axios.post(
			"https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
			{
				model: "GigaChat-Pro",
				messages: [{ role: "user", content: prompt }]
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json"
				},
				httpsAgent
			}
		);

		const result = response.data.choices?.[0]?.message?.content;
		res.json({ place: result ?? "Не удалось получить ответ" });
	} catch (e: any) {
		console.error("GigaChat error:", e?.response?.data ?? e.message);
		res.status(500).json({ error: "Ошибка при обращении к GigaChat" });
	}
};

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
						content: `Предложи интересное место для посещения в России. Нужно что-то оригинальное, не банальное. 
											Это может быть как природная достопримечательность, так и необычный город или культурное событие.

											Нужен короткий ответ для карточки на сайте.

											Требования:
											- без markdown
											- без звёздочек
											- без списков
											- без длинных тире (используй средние тире)
											- без кавычек
											- без вводных фраз и пояснений
											- естественный, живой, человеческий стиль. Как пример - тексты в соцсетях aviasales.
											- не более 250 символов в описании` // Вот это идет в чат
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
