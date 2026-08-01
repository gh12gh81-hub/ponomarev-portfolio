# Добавление проектов

Все проекты сайта хранятся в `public/data/projects.json`. Этот файл используется и локально, и production API на Vercel. Рекомендуемый способ управления — защищённая панель `/admin-portfolio`; её настройка описана в `ADMIN.md`.

Чтобы добавить проект:

1. Загрузите изображения и видео в Cloudinary и сохраните их public ID.
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
  "gallery": [
    "image-1.jpg",
    {
      "type": "video",
      "src": "portfolio/projects/project-slug/showreel",
      "poster": "portfolio/projects/project-slug/showreel-poster"
    }
  ]
}
```

Старый строковый формат элементов `gallery` остаётся форматом изображения. Для видео используйте объект с `type: "video"` и `src`. Поле `poster` необязательно: без него Cloudinary сформирует постер из первого кадра видео.

После сохранения проект автоматически появится на главной странице и на каждой странице услуги, указанной в `services`. Дополнительное редактирование компонентов React не требуется.
