# Nikolai Ponomarev — Portfolio

Персональное портфолио на React, TypeScript и Vite. Публичная версия получает проекты из `public/data/projects.json`, изображения доставляются через Cloudinary, публикация выполняется на Vercel.

## Запуск

```sh
npm install
npm run dev
```

Production-сборка:

```sh
npm run build
```

## Админ-панель

Защищённый редактор доступен по адресу `/admin-portfolio` и намеренно отсутствует в навигации сайта.

Для локальной разработки вместе с административными API:

```sh
npm run dev:admin
```

Подробная настройка пароля, Cloudinary, GitHub и Vercel находится в [ADMIN.md](./ADMIN.md).

Проверка серверной логики админ-панели:

```sh
npm run admin:verify
```

Ручной формат данных проектов описан в [PROJECTS.md](./PROJECTS.md).
