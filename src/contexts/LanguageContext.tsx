import { createContext, useState, useContext, ReactNode } from 'react';

const translations = {
  ru: {
    header: { work: 'WORK', services: 'SERVICES', about: 'ABOUT', contact: 'CONTACT' },
    home: {
      title: 'Nikolai<br/>Graphic Designer',
      branding: 'Branding', packaging: 'Packaging', ui: 'UI', motion: 'Motion',
      scroll: '↓ Scroll to explore', loadMore: 'Load more'
    },
    about: {
      title: 'Nikolai<br/>Ponomarev',
      text: 'Привет. Меня зовут Николай. Я графический дизайнер.<br/>Специализируюсь на брендинге, упаковке, цифровых интерфейсах и моушн-дизайне.',
      areas: 'Области и услуги'
    },
    project: {
      client: 'Клиент', tools: 'Инструменты', challenge: 'Задача', solution: 'Решение', next: 'Следующий проект',
      loading: 'Загрузка...',
      error: 'Ошибка загрузки проектов. Попробуйте обновить страницу.',
      retry: 'Повторить'
    },
    services: {
      title: 'Услуги', subtitle: 'Дизайн, который решает задачи. От идеи до реализации. Опираюсь на профессиональное образование и реальный опыт.',
      brandIdentity: 'Brand Identity', brandDesc: 'Логотипы, брендбуки, айдентика с нуля. Системный подход к визуалу бренда.',
      packaging: 'Packaging', packagingDesc: 'Упаковка, которая выделяется. Анализ рынка, эргономика и продающая эстетика.',
      uiux: 'UI / UX Design', uiuxDesc: 'Интуитивные интерфейсы и прототипы. Проектирование цифровых продуктов.',
      motion: 'Motion Design', motionDesc: 'Оживление идей. Анимированные баннеры, HUD-элементы и презентации.',
      artDirection: 'Art Direction', artDesc: 'Визуальная стратегия и управление стилем. Создание цельной истории бренда.'
    },
    brandIdentity: { title: 'Brand Identity', desc: 'Системный подход к визуалу бренда. Разработка идей, логотипов, цветовых палитр и полных брендбуков, которые работают на долгосрочную узнаваемость компании.',
      certTitle: 'Сертификаты и обучение', cert1: 'Дизайнер логотипа и фирменного стиля (Skillbox)', cert2: 'Графический дизайн с нуля 2.0 (Skillbox)', cert3: 'Шрифт в дизайне (Skillbox)', cert4: 'Практика по графическому дизайну (Skillbox)',
      skillTitle: 'Навыки и инструменты', skillList: 'Adobe Illustrator, Photoshop, Figma, InDesign. Глубокая типографика, цветокоррекция, создание гайдлайнов и векторная графика.'
    },
    packaging: { title: 'Packaging Design', desc: 'Создание эстетичной и продающей упаковки, которая выделяется на полке. Анализ рыночных трендов, эргономика формы, работа с материалами и визуальная передача ценности продукта.',
      certTitle: 'Сертификаты и обучение', cert1: 'Дизайнер упаковки (Skillbox)', cert2: 'InDesign (Skillbox)', cert3: 'Adobe Illustrator с нуля (Skillbox)',
      skillTitle: 'Навыки и инструменты', skillList: 'Adobe Illustrator, InDesign, Photoshop. Макетирование, понимание физики материалов, препресс и постпечатная обработка.'
    },
    uiux: { title: 'UI / UX Design', desc: 'Проектирование удобных и интуитивно понятных цифровых интерфейсов. Глубокое понимание пользовательских сценариев, создание прототипов, адаптивная верстка макетов и работа с современными дизайн-системами.',
      certTitle: 'Сертификаты и обучение', cert1: 'Обучение основам Figma (Нетология)', cert2: 'Насмотренность в UX/UI (Нетология)', cert3: 'Обзор главных инструментов дизайнера (Нетология)', cert4: 'Практика Frontend (Skillbox) — React, TS, Vue.js',
      skillTitle: 'Навыки и инструменты', skillList: 'Figma, Webflow, React, TypeScript, Vue.js. Прототипирование, пользовательские сценарии, CI/CD, адаптив.'
    },
    motion: { title: 'Motion Design', desc: 'Оживление статичного контента. Создание рекламных роликов, эффектных презентаций, анимированных HUD-элементов для игр и динамичных лендингов, притягивающих внимание зрителя.',
      certTitle: 'Сертификаты и обучение', cert1: 'Графический дизайнер PRO (Skillbox)', cert2: 'Adobe Illustrator с нуля 2.0 (Skillbox)', cert3: 'InDesign (Skillbox)', cert4: 'Практика Frontend (Skillbox) — анимация через код',
      skillTitle: 'Навыки и инструменты', skillList: 'Adobe After Effects, Premiere Pro, Illustrator, Figma. Анимация, переходы, визуальные эффекты, композитинг.'
    },
    artDirection: { title: 'Art Direction', desc: 'Визуальная стратегия и управление стилем проекта. От подбора референсов и атмосферы до контроля финального качества исполнения. Создание цельной визуальной истории, которая резонирует с аудиторией.',
      certTitle: 'Сертификаты и обучение', cert1: 'Графический дизайнер PRO (Skillbox)', cert2: 'Дизайнер логотипа и фирменного стиля (Skillbox)', cert3: 'Насмотренность в UX/UI (Нетология)', cert4: 'Шрифт в дизайне (Skillbox)',
      skillTitle: 'Навыки и инструменты', skillList: 'Композиция, типографика, колористика, архитектура бренда. Управление творческими задачами и соответствие бизнес-целям.'
    },
    notFound: { code: '404', title: 'Страница не найдена', sub: 'Возможно, вы перешли по неверной ссылке или проект был перемещён.', back: 'Вернуться на главную →' },
    contacts: { 
      title: 'Свяжитесь<br/>со мной', phone: 'Телефон', email: 'Email', telegram: 'Telegram', website: 'Сайт',
      cvBtn: '↓ Скачать CV'
    },
    footer: {
      text: 'РАЗРАБОТАНО ПОНОМАРЕВЫМ НИКОЛАЕМ ВЛАДИМИРОВИЧЕМ 2026'
    },
    // ------ ПЕРЕВОДЫ ДЛЯ КОНКРЕТНЫХ ПРОЕКТОВ ------
    projectDetails: {
      'r-flot': {
        client: 'Р-Флот',
        description: 'Пригласительная кампания для судостроительного комплекса Р-Флот.',
        challenge: 'Создать уникальную пригласительную кампанию, которая отражала бы масштаб судостроения и инновации комплекса.',
        solution: 'Разработан минималистичный чертежный стиль с акцентным синим цветом, который объединяет техническую эстетику и роскошь мероприятия.'
      },
      'accent': {
        client: 'ACCENT',
        description: 'Айдентика бренда одежды и дизайн карточек маркетплейса.',
        challenge: 'Выделить люксовый бренд одежды среди сотен конкурентов на маркетплейсах и в социальных сетях.',
        solution: 'Создана минималистичная айдентика на контрасте черного и яркого акцента, внедренная во все носители от упаковки до мокапов.'
      },
      'sber-ea-pharmacy': {
        client: 'СберЕАПТЕКА',
        description: 'Концепция упаковки БАД с современной медицинской айдентикой.',
        challenge: 'Разработать упаковку БАД, которая внушает доверие, выглядит современно и соответствует строгим медицинским стандартам.',
        solution: 'Использована чистая типографика, микро-графика и строгая цветовая палитра, чтобы подчеркнуть премиальное качество продукта.'
      },
      'cyberrt': {
        client: 'CyberRT',
        description: 'Фирменный стиль, HUD и рекламные материалы киберспортивной команды.',
        challenge: 'Создать агрессивную, технологичную айдентику для киберспортивной команды, которая будет выделяться на трансляциях.',
        solution: 'Разработан яркий неоновый стиль с контрастным логотипом, внедренный в мерч, HUD и рекламные макеты.'
      },
      'arc-teryx': {
        client: "Arc'teryx",
        description: 'Шаблон буклета на 24 полосы для компании Arc’teryx.',
        challenge: 'Разработать модульную сетку для буклета, которая вмещает большие фотографии природы и минимальный текст.',
        solution: 'Реализована концепция «воздуха и гор»: огромные разворотные изображения чередуются с тонкой типографикой.'
      },
      'offf-moscow': {
        client: 'Offf Moscow',
        description: 'Фестиваль дизайна и цифрового искусства.',
        challenge: 'Разработать айдентику для фестиваля, объединяющую digital-арт, типографику и урбанистику.',
        solution: 'Создана яркая контрастная визуальная система на основе геометрии и мощного шрифтового акцента.'
      },
      'the-trip': {
        client: 'The Trip',
        description: 'Айдентика тревел-блога и цифровые носители.',
        challenge: 'Создать айдентику, которая передает атмосферу путешествий и вдохновляет на поездки.',
        solution: 'Была выбрана кинематографичная цветовая палитра и крупная типографика, создающие ощущение дорогого глянцевого журнала.'
      },
      'pioner': {
        client: 'Кинотеатр Пионер',
        description: 'Подбор шрифтовой пары для экосистемы бренда «Пионер».',
        challenge: 'Подобрать шрифтовую пару для кинотеатра, которая выглядит ретро и современно одновременно.',
        solution: 'Комбинация элегантного Playfair Display для заголовков и гротеска Inter для текстов создала атмосферу старого кино с новым звучанием.'
      },
      'le-petyt-paris': {
        client: 'Малый бизнес семейная булочная',
        description: 'Создать логотип по брифу заказчика.',
        challenge: 'Разработка логотипа для семейной пекарни, который отражает французскую эстетику и домашний уют.',
        solution: 'В логотипе скрыты имена владельцев, а также использован шрифт с рукописным характером, создающий ощущение ручной работы и тепла.'
      }
    }
  },
  en: {
    header: { work: 'WORK', services: 'SERVICES', about: 'ABOUT', contact: 'CONTACT' },
    home: {
      title: 'Nikolai<br/>Graphic Designer',
      branding: 'Branding', packaging: 'Packaging', ui: 'UI', motion: 'Motion',
      scroll: '↓ Scroll to explore', loadMore: 'Load more'
    },
    about: {
      title: 'Nikolai<br/>Ponomarev',
      text: 'Hi. My name is Nikolai. I\'m a graphic designer.<br/>Specializing in branding, packaging, digital interfaces and motion design.',
      areas: 'Areas & Services'
    },
    project: {
      client: 'Client', tools: 'Tools', challenge: 'Challenge', solution: 'Solution', next: 'Next Project',
      loading: 'Loading...',
      error: 'Error loading projects. Please refresh the page.',
      retry: 'Retry'
    },
    services: {
      title: 'Services', subtitle: 'Design that solves problems. From idea to execution. Based on professional education and real experience.',
      brandIdentity: 'Brand Identity', brandDesc: 'Logos, brand books, identity from scratch. A systematic approach to brand visuals.',
      packaging: 'Packaging', packagingDesc: 'Packaging that stands out. Market analysis, ergonomics and sales aesthetics.',
      uiux: 'UI / UX Design', uiuxDesc: 'Intuitive interfaces and prototypes. Digital product design.',
      motion: 'Motion Design', motionDesc: 'Bringing ideas to life. Animated banners, HUD elements and presentations.',
      artDirection: 'Art Direction', artDesc: 'Visual strategy and style management. Creating a cohesive brand story.'
    },
    brandIdentity: { title: 'Brand Identity', desc: 'A systematic approach to brand visuals. Development of ideas, logos, color palettes and full brand books that work for long-term brand recognition.',
      certTitle: 'Certificates & Education', cert1: 'Logo and Brand Identity Designer (Skillbox)', cert2: 'Graphic Design from scratch 2.0 (Skillbox)', cert3: 'Typography in Design (Skillbox)', cert4: 'Graphic Design Practice (Skillbox)',
      skillTitle: 'Skills & Tools', skillList: 'Adobe Illustrator, Photoshop, Figma, InDesign. Deep typography, color correction, guideline creation and vector graphics.'
    },
    packaging: { title: 'Packaging Design', desc: 'Creating aesthetic and sales-driven packaging that stands out on the shelf. Market trend analysis, form ergonomics, material work and visual transmission of product value.',
      certTitle: 'Certificates & Education', cert1: 'Packaging Designer (Skillbox)', cert2: 'InDesign (Skillbox)', cert3: 'Adobe Illustrator from scratch (Skillbox)',
      skillTitle: 'Skills & Tools', skillList: 'Adobe Illustrator, InDesign, Photoshop. Layout, material physics understanding, prepress and post-printing processing.'
    },
    uiux: { title: 'UI / UX Design', desc: 'Designing convenient and intuitive digital interfaces. Deep understanding of user scenarios, prototyping, adaptive layout and working with modern design systems.',
      certTitle: 'Certificates & Education', cert1: 'Figma Basics (Netology)', cert2: 'UX/UI Visual Literacy (Netology)', cert3: 'Overview of Main Design Tools (Netology)', cert4: 'Frontend Practice (Skillbox) — React, TS, Vue.js',
      skillTitle: 'Skills & Tools', skillList: 'Figma, Webflow, React, TypeScript, Vue.js. Prototyping, user scenarios, CI/CD, responsive design.'
    },
    motion: { title: 'Motion Design', desc: 'Bringing static content to life. Creating promotional videos, impressive presentations, animated HUD elements for games and dynamic landing pages that grab viewers attention.',
      certTitle: 'Certificates & Education', cert1: 'Graphic Designer PRO (Skillbox)', cert2: 'Adobe Illustrator from scratch 2.0 (Skillbox)', cert3: 'InDesign (Skillbox)', cert4: 'Frontend Practice (Skillbox) — animation through code',
      skillTitle: 'Skills & Tools', skillList: 'Adobe After Effects, Premiere Pro, Illustrator, Figma. Animation, transitions, visual effects, compositing.'
    },
    artDirection: { title: 'Art Direction', desc: 'Visual strategy and project style management. From reference selection and atmosphere to final quality control. Creating a cohesive visual story that resonates with the audience.',
      certTitle: 'Certificates & Education', cert1: 'Graphic Designer PRO (Skillbox)', cert2: 'Logo and Brand Identity Designer (Skillbox)', cert3: 'UX/UI Visual Literacy (Netology)', cert4: 'Typography in Design (Skillbox)',
      skillTitle: 'Skills & Tools', skillList: 'Composition, typography, color theory, brand architecture. Managing creative tasks and aligning with business goals.'
    },
    notFound: { code: '404', title: 'Page not found', sub: 'You might have followed a broken link or the project has moved.', back: 'Back to home →' },
    contacts: { 
      title: 'Get in<br/>touch', phone: 'Phone', email: 'Email', telegram: 'Telegram', website: 'Website',
      cvBtn: '↓ Download CV'
    },
    footer: {
      text: 'DEVELOPED BY PONOMAREV NIKOLAI VLADIMIROVICH 2026'
    },
    // ------ АНГЛИЙСКИЕ ПЕРЕВОДЫ ДЛЯ ПРОЕКТОВ ------
    projectDetails: {
      'r-flot': {
        client: 'R-Flot',
        description: 'Invitation campaign for the shipbuilding complex R-Flot.',
        challenge: 'Create a unique invitation campaign that reflects the scale of shipbuilding and the innovations of the complex.',
        solution: 'A minimalist drafting style with an accent blue color was developed, combining technical aesthetics and the luxury of the event.'
      },
      'accent': {
        client: 'ACCENT',
        description: 'Clothing brand identity and marketplace card design.',
        challenge: 'Stand out a luxury clothing brand among hundreds of competitors on marketplaces and social networks.',
        solution: 'Minimalist identity on the contrast of black and bright accent was created, implemented into all media from packaging to mockups.'
      },
      'sber-ea-pharmacy': {
        client: 'SberEAPharmacy',
        description: 'Concept of dietary supplement packaging with modern medical identity.',
        challenge: 'Develop dietary supplement packaging that inspires trust, looks modern, and meets strict medical standards.',
        solution: 'Clean typography, micro-graphics and a strict color palette were used to highlight the premium quality of the product.'
      },
      'cyberrt': {
        client: 'CyberRT',
        description: 'Corporate identity, HUD and advertising materials for an esports team.',
        challenge: 'Create an aggressive, technological identity for an esports team that will stand out on broadcasts.',
        solution: 'A bright neon style with a contrasting logo was developed, implemented into merch, HUD and advertising layouts.'
      },
      'arc-teryx': {
        client: "Arc'teryx",
        description: '24-page booklet template for Arc’teryx.',
        challenge: 'Develop a modular grid for a booklet that accommodates large nature photographs and minimal text.',
        solution: 'The concept of "air and mountains" was realized: huge double-page images alternate with thin typography.'
      },
      'offf-moscow': {
        client: 'Offf Moscow',
        description: 'Design and digital art festival.',
        challenge: 'Develop an identity for a festival that combines digital art, typography and urbanism.',
        solution: 'A bright contrasting visual system based on geometry and a powerful typographic accent was created.'
      },
      'the-trip': {
        client: 'The Trip',
        description: 'Travel blog identity and digital media.',
        challenge: 'Create an identity that conveys the atmosphere of travel and inspires trips.',
        solution: 'A cinematic color palette and large typography were chosen, creating the feeling of an expensive glossy magazine.'
      },
      'pioner': {
        client: 'Pioner Cinema',
        description: 'Font pair selection for the ecosystem of the Pioner brand.',
        challenge: 'Select a font pair for a cinema that looks retro and modern at the same time.',
        solution: 'The combination of elegant Playfair Display for headlines and grotesque Inter for texts created the atmosphere of old cinema with a new sound.'
      },
      'le-petyt-paris': {
        client: 'Small business family bakery',
        description: 'Create a logo according to the client\'s brief.',
        challenge: 'Development of a logo for a family bakery that reflects French aesthetics and home comfort.',
        solution: 'The logo hides the owners\' names, and a font with a handwritten character was used, creating a feeling of handmade work and warmth.'
      }
    }
  }
};

export type Language = 'ru' | 'en';
interface LanguageContextType { language: Language; t: (key: string) => string; toggleLanguage: () => void; }
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const getTranslationForLanguage = (language: Language, key: string): string => {
  const keys = key.split('.');
  let current: unknown = translations[language];

  for (const item of keys) {
    if (!current || typeof current !== 'object' || !(item in current)) return key;
    current = (current as Record<string, unknown>)[item];
  }

  return typeof current === 'string' ? current : key;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ru');
  const t = (key: string): string => getTranslationForLanguage(language, key);
  const toggleLanguage = () => setLanguage(prev => (prev === 'ru' ? 'en' : 'ru'));
  return (<LanguageContext.Provider value={{ language, t, toggleLanguage }}>{children}</LanguageContext.Provider>);
};
export const useTranslation = () => { const context = useContext(LanguageContext); if (!context) throw new Error('...'); return context; };
