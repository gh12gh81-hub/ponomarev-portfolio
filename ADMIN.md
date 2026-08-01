# Админ-панель портфолио

Адрес панели: `/admin-portfolio`. Ссылка намеренно не выводится в публичной навигации. Безопасность обеспечивает пароль и подписанная HttpOnly-сессия, а не секретность адреса.

## Возможности

- создание, изменение, удаление и сортировка проектов;
- редактирование русских и английских текстов;
- классификация проектов по страницам услуг;
- загрузка обложки, hero и нескольких изображений галереи в Cloudinary;
- изменение порядка изображений перетаскиванием или стрелками;
- сохранение `public/data/projects.json` через GitHub Contents API;
- автоматический запуск нового деплоя Vercel после GitHub-коммита.

## 1. Создание пароля

В терминале проекта выполните:

```sh
npm run admin:hash
```

Введите пароль длиной не меньше 12 символов. Команда выведет строку вида:

```text
scrypt:...:...
```

Сохраните всю строку в переменную Vercel `ADMIN_PASSWORD_HASH`. Сам пароль в Vercel или репозиторий добавлять не нужно.

Создайте независимый секрет сессии длиной не меньше 32 символов. Например:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Результат сохраните как `ADMIN_SESSION_SECRET`.

## 2. Cloudinary

В Cloudinary Console откройте API Keys и добавьте в Vercel:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

`CLOUDINARY_API_SECRET` используется только серверной функцией и никогда не отправляется в браузер. `VITE_CLOUDINARY_CLOUD_NAME` оставьте для отображения изображений на публичном сайте.

Изображения админки сохраняются в папках `portfolio/projects/<slug>`.

## 3. GitHub

Создайте fine-grained personal access token только для репозитория портфолио. Достаточно разрешения:

```text
Repository permissions → Contents → Read and write
```

Добавьте в Vercel:

```text
GITHUB_REPOSITORY=gh12gh81-hub/ponomarev-portfolio
GITHUB_BRANCH=main
GITHUB_TOKEN=<ваш токен>
```

Не добавляйте токен в `.env.example`, Git или клиентские переменные с префиксом `VITE_`.

## 4. Vercel

Добавьте переменные для Production. Если админка должна работать на Preview deployments, добавьте их также для Preview. После изменения переменных выполните новый deploy.

При сохранении админка обновляет `public/data/projects.json` отдельным GitHub-коммитом. Этот коммит запускает Vercel deployment. До завершения deployment старый публичный сайт продолжает работать без перерыва.

## Локальная проверка

Скопируйте нужные значения из `.env.example` в `.env.local`, установите:

```text
ADMIN_STORAGE=local
```

и запускайте:

```sh
npm run dev:admin
```

В локальном режиме сохранение меняет `public/data/projects.json` напрямую. Перед экспериментами убедитесь, что нужные изменения сохранены в Git.

Проверка серверной логики без изменения данных:

```sh
npm run admin:verify
```

## Безопасность

- административная cookie имеет `HttpOnly`, `SameSite=Strict` и `Secure` на Vercel;
- изменяющие запросы проверяют `Origin`;
- вход ограничен восемью попытками за 15 минут на один серверный экземпляр;
- структура и размер проектов проверяются сервером;
- GitHub token и Cloudinary secret доступны только серверным функциям;
- административная страница получает `noindex, nofollow`.
