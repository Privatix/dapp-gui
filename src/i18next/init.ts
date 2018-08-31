import i18next from 'i18next';

/* tslint:disable: no-var-requires */
const ru = require('./vocabulary/ru.json');
const en = require('./vocabulary/en.json');
/* tslint:enable: no-var-requires */

export const langs = [{value: 'ru', label: 'Русский'}, {value: 'en', label: 'English'}];
export const defLang = 'en';

const resources = {ru, en};

export default i18next
  .init({
    debug: true,
    fallbackLng: defLang,
    react: {
      wait: true,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    },
    resources
  });
