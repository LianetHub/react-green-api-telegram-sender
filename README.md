# Telegram Chat GREEN-API

Веб-чат на React для отправки и приёма текстовых сообщений Telegram через [GREEN-API](https://green-api.com/telegram/).

## Возможности

- Вход по `idInstance` / `apiTokenInstance` с проверкой `getStateInstance`
- Создание чата по телефону или Telegram ID (`checkAccount`)
- Отправка текста (`sendMessage`)
- Приём входящих через long-poll (`receiveNotification` + `deleteNotification`)
- Подхват недавних входящих из журнала (`lastIncomingMessages`)
- Автонастройка инстанса: webhook очищается, включается только `incomingWebhook`
- Сохранение сессии и списка чатов в `localStorage`

## Запуск

```bash
npm install
npm run dev
```

Откройте URL из терминала (обычно `http://localhost:5173`).

## Где взять idInstance / apiTokenInstance

1. Зарегистрируйтесь в [консоли GREEN-API](https://console.green-api.com/).
2. Создайте инстанс типа **Telegram**.
3. Авторизуйте аккаунт: отсканируйте QR-код приложением **Telegram**.
4. Скопируйте с карточки инстанса `idInstance` и `apiTokenInstance`.

## Как пользоваться

1. Войдите в приложение с данными инстанса.
2. Слева создайте чат:
   - по номеру (`79991234567`), или
   - по Telegram user id / готовому `chatId`.
3. Отправьте текстовое сообщение.
4. Ответ из Telegram появится в чате автоматически.

## Стек

- React 19 + TypeScript + Vite + SCSS
- Axios
- GREEN-API: `getStateInstance`, `setSettings`, `checkAccount`, `sendMessage`, `receiveNotification`, `deleteNotification`, `lastIncomingMessages`

## Структура

```
src/
  api/          # HTTP-клиент и методы GREEN-API
  components/   # Login, Sidebar, Chat, сообщения
  hooks/        # сессия, отправка, создание чата, опрос
  types/        # типы credentials, chat, API
  utils/        # телефон, credentials, сессия чатов
  styles/       # SCSS
```

## Скрипты

| Команда                | Описание             |
| ---------------------- | -------------------- |
| `npm run dev`          | Локальная разработка |
| `npm run build`        | Сборка production    |
| `npm run preview`      | Просмотр сборки      |
| `npm run lint`         | ESLint               |
| `npm run format`       | Prettier (запись)    |
| `npm run format:check` | Prettier (проверка)  |
