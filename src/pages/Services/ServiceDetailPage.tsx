import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CloudinaryImage } from '@/components/CloudinaryImage/CloudinaryImage';
import { Seo } from '@/components/Seo/Seo';
import { useTranslation } from '@/contexts/LanguageContext';
import { fetchProjects } from '@/features/projectsSlice';
import type { AppDispatch, RootState } from '@/store';
import type { ServiceCategory } from '@/types';
import { typography } from '@/utils/typography';
import styles from './Services.module.css';

export type ServiceKey = 'brandIdentity' | 'packaging' | 'uiux' | 'motion' | 'artDirection';

const serviceCategoryByKey: Record<ServiceKey, ServiceCategory> = {
  brandIdentity: 'brand-identity',
  packaging: 'packaging',
  uiux: 'ui-ux',
  motion: 'motion-design',
  artDirection: 'art-direction',
};

interface ServiceExtra {
  certificates: number;
  deliverables: { ru: string[]; en: string[] };
}

const serviceExtras: Record<ServiceKey, ServiceExtra> = {
  brandIdentity: {
    certificates: 4,
    deliverables: {
      ru: ['Логотип и визуальная система', 'Цвет и типографика', 'Гайдлайн или брендбук', 'Носители для запуска бренда'],
      en: ['Logo and visual system', 'Color and typography', 'Guidelines or brand book', 'Launch-ready brand assets'],
    },
  },
  packaging: {
    certificates: 3,
    deliverables: {
      ru: ['Анализ категории и полки', 'Концепция упаковки', 'Дизайн линейки и SKU', 'Подготовка макетов к печати'],
      en: ['Category and shelf analysis', 'Packaging concept', 'Product line and SKU design', 'Print-ready artwork'],
    },
  },
  uiux: {
    certificates: 4,
    deliverables: {
      ru: ['Исследование и сценарии', 'Прототип и структура', 'Визуальная концепция', 'Адаптивный UI и дизайн-система'],
      en: ['Research and user flows', 'Prototype and structure', 'Visual concept', 'Responsive UI and design system'],
    },
  },
  motion: {
    certificates: 4,
    deliverables: {
      ru: ['Сценарий и раскадровка', 'Стиль кадров', 'Анимация и композитинг', 'Форматы для нужных площадок'],
      en: ['Script and storyboard', 'Style frames', 'Animation and compositing', 'Platform-ready formats'],
    },
  },
  artDirection: {
    certificates: 4,
    deliverables: {
      ru: ['Визуальная стратегия', 'Референсы и арт-направление', 'Система носителей', 'Контроль целостности реализации'],
      en: ['Visual strategy', 'References and art direction', 'Cross-channel visual system', 'Creative quality control'],
    },
  },
};

const sharedCopy = {
  ru: {
    service: 'Услуга',
    processTitle: 'Как строится работа',
    processIntro: 'Прозрачный процесс от постановки задачи до готовой дизайн-системы.',
    process: [
      ['Погружение', 'Разбираю задачу, аудиторию, продукт и конкурентный контекст.'],
      ['Концепция', 'Формирую направление, собираю визуальную логику и согласовываю ключевую идею.'],
      ['Система и запуск', 'Детализирую решение и передаю готовые материалы с правилами использования.'],
    ],
    deliverablesTitle: 'Что входит в работу',
    projectsTitle: 'Проекты по направлению',
    projectsIntro: 'Примеры задач, в которых дизайн работает как цельная система.',
    emptyProjects: 'Проекты с этой классификацией появятся здесь автоматически.',
    ctaTitle: 'Есть задача? Давайте обсудим.',
    ctaText: 'Расскажите о проекте — предложу подходящий формат работы и следующие шаги.',
    ctaButton: 'Связаться',
  },
  en: {
    service: 'Service',
    processTitle: 'How the work is structured',
    processIntro: 'A clear process from defining the task to delivering a complete design system.',
    process: [
      ['Discovery', 'I study the task, audience, product and competitive context.'],
      ['Concept', 'I shape the direction, build the visual logic and align the key idea.'],
      ['System and launch', 'I refine the solution and deliver production-ready assets with usage rules.'],
    ],
    deliverablesTitle: 'What is included',
    projectsTitle: 'Related projects',
    projectsIntro: 'Selected work where design functions as one coherent system.',
    emptyProjects: 'Projects with this classification will appear here automatically.',
    ctaTitle: 'Have a project? Let’s talk.',
    ctaText: 'Share your task and I will suggest the right format and next steps.',
    ctaButton: 'Get in touch',
  },
};

export function ServiceDetailPage({ serviceKey }: { serviceKey: ServiceKey }) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: projects, status } = useSelector((state: RootState) => state.projects);
  const { t, language } = useTranslation();
  const data = serviceExtras[serviceKey];
  const serviceCategory = serviceCategoryByKey[serviceKey];
  const relatedProjects = projects.filter(project => project.services?.includes(serviceCategory));
  const copy = sharedCopy[language];
  const title = t(`${serviceKey}.title`);
  const description = t(`${serviceKey}.desc`);
  const certificates = Array.from(
    { length: data.certificates },
    (_, index) => t(`${serviceKey}.cert${index + 1}`),
  );

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [dispatch, status]);

  return (
    <div className={styles.detail}>
      <Seo
        title={`${title} — ${language === 'ru' ? 'услуги дизайна' : 'design services'}`}
        description={description}
        image={relatedProjects[0]?.cover}
      />

      <section className={styles.textHero}>
        <div className={styles.textHeroContent}>
          <span className={styles.eyebrow}>{copy.service} / 0{Object.keys(serviceExtras).indexOf(serviceKey) + 1}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{typography(description)}</p>
        </div>
      </section>

      <section className={styles.selectedWork}>
        <div className={styles.sectionHeader}>
          <h2>{copy.projectsTitle}</h2>
          <p>{typography(copy.projectsIntro)}</p>
        </div>
        {relatedProjects.length > 0 ? (
          <div className={styles.projectGrid}>
          {relatedProjects.map(project => (
            <Link className={styles.projectCard} to={`/projects/${project.slug}`} key={project.slug}>
              <div className={styles.projectImage}>
                <CloudinaryImage
                  src={project.cover}
                  alt={project.title}
                  width={1200}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <span className={styles.projectCategory}>{typography(project.category)}</span>
              <h3>{project.title}<span aria-hidden="true"> →</span></h3>
            </Link>
          ))}
          </div>
        ) : status === 'succeeded' ? (
          <p className={styles.emptyProjects}>{typography(copy.emptyProjects)}</p>
        ) : null}
      </section>

      <section className={styles.storyBlock}>
        <div className={styles.storyItem}>
          <h2>{t(`${serviceKey}.certTitle`)}</h2>
          <ul>
            {certificates.map(certificate => (
              <li key={certificate}><span aria-hidden="true">✓</span>{typography(certificate)}</li>
            ))}
          </ul>
        </div>
        <div className={styles.storyItem}>
          <h2>{t(`${serviceKey}.skillTitle`)}</h2>
          <p>{typography(t(`${serviceKey}.skillList`))}</p>
        </div>
      </section>

      <section className={styles.processBlock}>
        <div className={styles.sectionHeader}>
          <h2>{copy.processTitle}</h2>
          <p>{typography(copy.processIntro)}</p>
        </div>
        <div className={styles.processGrid}>
          {copy.process.map(([stepTitle, stepText], index) => (
            <article className={styles.processStep} key={stepTitle}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <h3>{stepTitle}</h3>
              <p>{typography(stepText)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.deliverablesBlock}>
        <h2>{copy.deliverablesTitle}</h2>
        <ul className={styles.deliverablesList}>
          {data.deliverables[language].map(item => (
            <li key={item}><span>{typography(item)}</span><span aria-hidden="true">↗</span></li>
          ))}
        </ul>
      </section>

      <section className={styles.serviceCta}>
        <div>
          <h2>{copy.ctaTitle}</h2>
          <p>{typography(copy.ctaText)}</p>
        </div>
        <Link to="/contacts" className={styles.ctaButton}>{copy.ctaButton}<span aria-hidden="true"> →</span></Link>
      </section>
    </div>
  );
}
