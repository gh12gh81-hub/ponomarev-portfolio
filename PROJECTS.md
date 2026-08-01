# Добавление проектов

Все проекты сайта хранятся в `public/data/projects.json`. Этот файл используется и локально, и production API на Vercel. Рекомендуемый способ управления — защищённая панель `/admin-portfolio`; её настройка описана в `ADMIN.md`.

Чтобы добавить проект:

1. Загрузите изображения в Cloudinary и сохраните их имена файлов.
2. Добавьте новый объект в массив `public/data/projects.json` с уникальными `id` и `slug`.
3. Укажите одну или несколько услуг в поле `services`.

Допустимые значения `services`:

- `brand-identity` — фирменный стиль;
- `packaging` — упаковка;
- `ui-ux` — интерфейсы;
- `motion-design` — моушн-дизайн;
- `art-direction` — арт-дирекшн.

Пример:

```json
{
  "id": 10,
  "title": "Название проекта",
  "slug": "project-slug",
  "year": "2026",
  "category": "Brand Identity",
  "services": ["brand-identity", "art-direction"],
  "description": "Краткое описание проекта.",
  "layout": "wide",
  "client": "Клиент",
  "tools": "Figma, Illustrator",
  "challenge": "Задача проекта.",
  "solution": "Решение проекта.",
  "cover": "cover.jpg",
  "hero": "hero.jpg",
  "banner": "",
  "gallery": ["image-1.jpg", "image-2.jpg"]
}
```

После сохранения проект автоматически появится на главной странице и на каждой странице услуги, указанной в `services`. Дополнительное редактирование компонентов React не требуется.
