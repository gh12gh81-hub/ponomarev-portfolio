import { apiClient } from './client';

export const getProjects = async () => {
  // Если мы на Vercel (продакшен) — стучимся в Serverless функцию
  if (import.meta.env.PROD) {
    const response = await apiClient.get('/api/projects');
    return response.data;
  }

  // Если локально (npm run dev) — читаем JSON прямо из папки public
  const response = await fetch('/data/projects.json');
  
  if (!response.ok) {
    throw new Error('Не удалось загрузить данные локально');
  }
  
  return response.json();
};
