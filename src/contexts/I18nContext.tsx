import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import i18n from '@/i18n/config';

interface I18nContextType {
  currentLanguage: string;
  setLanguage: (language: string) => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    localStorage.getItem('app_language') || 'en'
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize i18n with saved language
    if (!isInitialized) {
      i18n.changeLanguage(currentLanguage);
      setIsInitialized(true);
    }
  }, [isInitialized, currentLanguage]);

  const setLanguage = async (language: string) => {
    try {
      // Update i18n
      await i18n.changeLanguage(language);
      
      // Update localStorage
      localStorage.setItem('app_language', language);
      
      // Update state to trigger re-render
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  };

  return (
    <I18nContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
