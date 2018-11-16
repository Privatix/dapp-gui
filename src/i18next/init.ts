import i18next from 'i18next';

/* tslint:disable: no-var-requires */
const ru = require('./vocabulary/ru.json');
const en = require('./vocabulary/en.json');
/* tslint:enable: no-var-requires */

export const langs = [
    {value: 'ru', label: 'Русский'},
    {value: 'ar', label: 'العربية'},
    {value: 'cn', label: '中文'},
    {value: 'de', label: 'Germanisch'},
    {value: 'es', label: 'Español'},
    {value: 'fr', label: 'Français'},
    {value: 'ja', label: '日本人'},
    {value: 'ko', label: '한국어'},
    {value: 'en', label: 'English'}
    ];

export const defLang = 'en';

const resources = {ru, en};

export default i18next
  .init({
    debug: false,
    fallbackLng: defLang,
    react: {
      wait: true,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    },
    resources
  });
