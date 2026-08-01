import { useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { getCloudinaryUrl } from '@/components/CloudinaryImage/CloudinaryImage';

const SITE_NAME = 'Nikolai Ponomarev';
const DEFAULT_IMAGE = 'coverR_gl999s.png';

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
}

const setMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
};

export function Seo({ title, description, image = DEFAULT_IMAGE, noIndex = false }: SeoProps) {
  const { language } = useTranslation();

  useEffect(() => {
    const hasSiteName = /nikolai ponomarev|николай пономарев/i.test(title);
    const fullTitle = hasSiteName ? title : `${title} — ${SITE_NAME}`;
    const pageUrl = new URL(window.location.pathname, window.location.origin).toString();
    const imageUrl = image.startsWith('http') ? image : getCloudinaryUrl(image, 1200);

    document.title = fullTitle;
    document.documentElement.lang = language;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', language === 'ru' ? 'ru_RU' : 'en_US');
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', pageUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl;
  }, [description, image, language, noIndex, title]);

  return null;
}
