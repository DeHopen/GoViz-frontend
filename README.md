# GoViz — Frontend

Frontend-приложение для визуализации Go-кода. Пользователь загружает `.go` файл и получает интерактивную HTML-визуализацию.

## Стек технологий

| Технология | Назначение |
|---|---|
| **React 19** | UI-библиотека |
| **TypeScript** | Статическая типизация |
| **Vite** | Сборка и dev-сервер |
| **RTK Query** | Серверное состояние, кэширование |
| **React Router v7** | Клиентская маршрутизация |
| **SCSS Modules** | Модульная стилизация с поддержкой тем |

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (порт 3000)
npm run dev

# Продакшен-сборка
npm run build
```

## Переменные окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Базовый URL backend API |

В dev-режиме запросы к `/api` проксируются через Vite на `http://localhost:8080`.

## Структура проекта

```
src/
├── components/                 # UI-компоненты
│   ├── Header/                 # Навигация + тема
│   ├── Footer/                 # Подвал
│   ├── FileUpload/             # Drag & drop + форма загрузки
│   ├── FileCard/               # Карточка файла в списке
│   ├── ThemeToggle/            # Переключатель темы
│   ├── Loader/                 # Спиннер
│   └── ErrorMessage/           # Сообщение об ошибке
├── pages/
│   ├── HomePage/               # Загрузка файла
│   ├── ViewPage/               # Просмотр визуализации (iframe)
│   └── FilesPage/              # Список загруженных файлов
├── services/api.ts             # RTK Query — все API-запросы
├── store/store.ts              # Redux store
├── context/ThemeContext.tsx     # Тема (light/dark)
├── hooks/useFileUpload.ts      # Хук загрузки с прогрессом
├── types/index.ts              # TypeScript типы (GoFile, FileListResponse, etc.)
├── styles/                     # SCSS модули
├── App.tsx                     # Роутинг
└── main.tsx                    # Точка входа
```

## Маршруты

| Путь | Страница | Описание |
|---|---|---|
| `/` | HomePage | Загрузка файла |
| `/files` | FilesPage | Список загруженных файлов |
| `/files/:id` | ViewPage | Визуализация конкретного файла |

## Основной сценарий

1. Пользователь загружает `.go` файл на главной странице
2. Выбирает стиль визуализации (опционально, по умолчанию `solarized-light`)
3. Файл отправляется на backend (`POST /api/files`)
4. Происходит редирект на страницу просмотра (`/files/:id`)
5. Если файл ещё обрабатывается — показывается лоадер
6. Когда визуализация готова — отображается в `<iframe>` на всю страницу
7. Можно открыть визуализацию в новой вкладке

## RTK Query API

```typescript
useGetFilesQuery()          // GET    /api/files
useGetFileQuery(id)         // GET    /api/files/:id
useUploadFileMutation()     // POST   /api/files
useDeleteFileMutation()     // DELETE /api/files/:id
```

- Автоматическое кэширование и дедупликация
- Инвалидация кэша после загрузки/удаления

## API Backend (Bildigo)

| Метод | Endpoint | Описание |
|---|---|---|
| `POST` | `/api/files` | Загрузка файла (multipart: `file`, `style`) |
| `GET` | `/api/files` | Список файлов → `{ files, total }` |
| `GET` | `/api/files/:id` | Метаданные файла |
| `DELETE` | `/api/files/:id` | Удаление файла |
| `GET` | `/api/files/:id/view` | HTML-визуализация |
| `GET` | `/health` | Проверка здоровья сервиса |

**Модель FileOut:** `id`, `filename`, `style`, `status`, `created_at`, `updated_at`, `error_message`

**Статусы:** `uploaded` → `processing` → `completed` / `failed`

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Dev-сервер (порт 3000) |
| `npm run build` | Продакшен-сборка |
| `npm run preview` | Просмотр сборки |
