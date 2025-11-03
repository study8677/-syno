import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

type Language = 'en' | 'zh-CN';
type Translations = Record<string, any>;

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const storedLang = localStorage.getItem('syno_language');
        if (storedLang === 'en' || storedLang === 'zh-CN') {
            return storedLang;
        }
        // Default to Chinese Simplified
        return 'zh-CN';
    });
    
    const [translations, setTranslations] = useState<Record<Language, Translations> | null>(null);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const enRes = await fetch('/i18n/en.json');
                const enData = await enRes.json();
                const zhCNRes = await fetch('/i18n/zh-CN.json');
                const zhCNData = await zhCNRes.json();
                setTranslations({ 'en': enData, 'zh-CN': zhCNData });
            } catch (e) {
                console.error("Could not load translation files.", e);
            }
        };
        loadTranslations();
    }, []);

    useEffect(() => {
        localStorage.setItem('syno_language', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = useMemo(() => (key: string, replacements: Record<string, string | number> = {}): string => {
        if (!translations) return key;

        const resolveKey = (transObj: Translations, keyParts: string[]): string | undefined => {
            let result: any = transObj;
            for (const k of keyParts) {
                result = result?.[k];
                if (result === undefined) return undefined;
            }
            return result;
        };

        const keys = key.split('.');
        let template = resolveKey(translations[language], keys) ?? resolveKey(translations['en'], keys) ?? key;

        if (typeof template === 'string') {
            Object.entries(replacements).forEach(([rKey, value]) => {
                const regex = new RegExp(`{{${rKey}}}`, 'g');
                template = template.replace(regex, String(value));
            });
        }

        return template;
    }, [language, translations]);
    
    const value = {
        language,
        setLanguage,
        t,
    };
    
    if (!translations) {
        return null;
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};