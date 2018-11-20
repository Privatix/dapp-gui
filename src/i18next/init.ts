import i18next from 'i18next';

/* tslint:disable: no-var-requires */
const ru = require('./vocabulary/ru.json');
const en = require('./vocabulary/en.json');
const ar = require('./vocabulary/ar.json');
const cn = require('./vocabulary/cn.json');
const de = require('./vocabulary/de.json');
const es = require('./vocabulary/es.json');
const fr = require('./vocabulary/fr.json');
const ja = require('./vocabulary/ja.json');
const ko = require('./vocabulary/ko.json');
/* tslint:enable: no-var-requires */

export const langs = [
    {value: 'en', label: 'English'},
    {value: 'cn', label: '中文'},
    {value: 'ru', label: 'Русский'},
    {value: 'ar', label: 'العربية'},
    {value: 'de', label: 'Germanisch'},
    {value: 'es', label: 'Español'},
    {value: 'fr', label: 'Français'},
    {value: 'ja', label: '日本人'},
    {value: 'ko', label: '한국어'}
];

export const defLang = 'en';

const resources = {ru, en, ar, cn, de, es, fr, ja, ko};

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
