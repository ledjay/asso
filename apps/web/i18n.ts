import { getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  // For MVP, hardcode to French
  // Post-MVP: Get from user preference or URL
  const locale = 'fr';

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
