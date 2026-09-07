import { useState, useCallback, useEffect } from 'react';
import { storage } from '../services/storage';
import { translations, TranslationKey } from '../translations';
import { Language } from '../types';

export const useLanguage = () => {
  const [language, setLanguageState] = useState<Language>(() => storage.getLanguage());

  useEffect(() => {
    const handleLanguageChange = (event: any) => {
      setLanguageState(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    storage.setLanguage(lang);
    setLanguageState(lang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  return { language, setLanguage, t };
};
