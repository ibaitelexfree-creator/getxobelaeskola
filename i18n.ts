import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['es', 'eu', 'en', 'fr'];

export default getRequestConfig(async ({ locale }) => {
    console.log('!!! ROOT I18N EXECUTING !!! Locale:', locale);
    console.trace('!!! ROOT I18N STACK !!!');

    const activeLocale = (locale && locales.includes(locale as any)) ? locale : 'es';

    return {
        locale: activeLocale,
        messages: (await import(`./messages/${activeLocale}.json`)).default
    };
});
