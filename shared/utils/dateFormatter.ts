export const formatLocalizedDate = (dateString: string, lang: string): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};