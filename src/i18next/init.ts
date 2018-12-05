import i18next from 'i18next';

import { langsList } from './langs';

export const langs = langsList;

export const defLang = 'en';

const resources = langs.map(lang => lang.value).reduce((acc, lang) => {
    acc[lang] = require(`./vocabulary/${lang}.json`);
    return acc;
}, {});

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
