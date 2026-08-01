/**
 * Универсальная типографская обработка текста:
 * - убирает висячие предлоги (склеивает со следующим словом);
 * - склеивает последние два слова (убирает сироты).
 */
export const typography = (text: string = ''): string => {
  // 1. Список русских предлогов (можно расширить)
  const prepositions = /\b(в|во|к|ко|с|со|о|об|обо|и|а|но|на|по|за|из|от|до|для|без|не|при|под|над)\s+/gi;
  
  let result = text.replace(prepositions, '$1\u00A0');

  // 2. Склеиваем последние два слова
  const words = result.trim().split(' ');
  if (words.length > 1) {
    const last = words.pop();
    const prev = words.pop();
    words.push(`${prev}\u00A0${last}`);
    result = words.join(' ');
  }

  return result;
};
