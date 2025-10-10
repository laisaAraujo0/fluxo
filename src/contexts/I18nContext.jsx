import { createContext, useContext, useState, useEffect } from 'react';
import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';

const I18nContext = createContext();

const translations = {
  'pt-BR': ptBR,
  'en-US': enUS
};

const availableLanguages = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
];

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt-BR');

  useEffect(() => {
    // Carregar idioma salvo do localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    } else {
      // Detectar idioma do navegador
      const browserLanguage = navigator.language || navigator.userLanguage;
      if (translations[browserLanguage]) {
        setLanguage(browserLanguage);
      }
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
      
      // Atualizar atributo lang do HTML
      document.documentElement.lang = newLanguage;
    }
  };

  // Função para traduzir com suporte a chaves aninhadas
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Retorna a chave se não encontrar tradução
      }
    }

    // Substituir parâmetros na string
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    availableLanguages
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;

