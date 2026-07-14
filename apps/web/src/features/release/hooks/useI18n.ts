import { useState, useCallback, useEffect } from 'react';
import { LOCALES, Locale, TranslationDictionary } from '../i18n/locales';

export const useI18n = () => {
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('rr_locale');
    return (saved as Locale) || 'en';
  });

  const changeLocale = useCallback((newLocale: Locale) => {
    setCurrentLocale(newLocale);
    localStorage.setItem('rr_locale', newLocale);

    // Dynamic RTL support: update document HTML dir attribute on the fly
    const direction = LOCALES[newLocale]?.direction || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = newLocale;
  }, []);

  useEffect(() => {
    // Sync direction on mount
    const direction = LOCALES[currentLocale]?.direction || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  /**
   * Translates a translation key with fallback.
   */
  const t = useCallback(
    (key: keyof TranslationDictionary): string => {
      const locInfo = LOCALES[currentLocale] || LOCALES['en'];
      return locInfo.dictionary[key] || LOCALES['en'].dictionary[key] || String(key);
    },
    [currentLocale],
  );

  return {
    locale: currentLocale,
    direction: LOCALES[currentLocale]?.direction || 'ltr',
    t,
    changeLocale,
    supportedLocales: Object.keys(LOCALES) as Locale[],
  };
};
