/**
 * Универсальная типографская обработка текста:
 * - убирает висячие предлоги (склеивает со следующим словом);
 * - склеивает последние два слова (убирает сироты).
 */
export const typography = (text: string = ''): string => {
  const nonBreakingSpace = '\u00A0';
  const shortWords = [
    'без', 'для', 'над', 'обо', 'от', 'перед', 'по', 'под', 'при', 'про', 'через',
    'в', 'во', 'до', 'за', 'из', 'к', 'ко', 'на', 'о', 'об', 'с', 'со', 'у',
    'а', 'и', 'но', 'не',
    'a', 'an', 'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'with',
  ].join('|');

  // В JavaScript \b не считает кириллицу словом, поэтому явно учитываем
  // начало строки и знак/пробел перед коротким словом.
  const hangingWords = new RegExp(`(^|[\\s([{«„"'])(${shortWords})\\s+(?=\\S)`, 'giu');
  let result = text.trim().replace(/\s+/gu, ' ');

  // Повтор нужен для последовательностей вроде «и в проекте».
  for (let pass = 0; pass < 2; pass += 1) {
    result = result.replace(hangingWords, `$1$2${nonBreakingSpace}`);
  }

  // Не оставляем последнее слово абзаца сиротой.
  return result.replace(/(\S+)\s+(\S+)$/u, `$1${nonBreakingSpace}$2`);
};
