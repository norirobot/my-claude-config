import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { locales, LocaleKey, TranslationKeys } from '../locales'
import { motion, AnimatePresence } from 'framer-motion'

interface LanguageContextType {
  language: LocaleKey
  setLanguage: (lang: LocaleKey) => void
  t: TranslationKeys
  isLoading: boolean
  availableLanguages: LanguageInfo[]
  isTransitioning: boolean
  formatDate: (date: Date, format?: 'short' | 'medium' | 'long') => string
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (amount: number, currency?: string) => string
  formatPercentage: (value: number) => string
  getDirection: () => 'ltr' | 'rtl'
}

interface LanguageInfo {
  code: LocaleKey
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | null>(null)

interface LanguageProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'ai-english-tutor-language'

// 지원 언어 정보
const availableLanguages: LanguageInfo[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' }
]

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LocaleKey>('ko')
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 로컬 스토리지에서 언어 설정 불러오기
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as LocaleKey
    if (savedLanguage && locales[savedLanguage]) {
      setLanguageState(savedLanguage)
      document.documentElement.lang = savedLanguage
    } else {
      // 브라우저 언어 감지
      const browserLanguage = navigator.language.toLowerCase()
      let detectedLang: LocaleKey = 'en'
      
      if (browserLanguage.startsWith('ko')) {
        detectedLang = 'ko'
      } else if (browserLanguage.startsWith('ja')) {
        detectedLang = 'ja'
      } else if (browserLanguage.startsWith('zh')) {
        detectedLang = 'zh'
      } else if (browserLanguage.startsWith('es')) {
        detectedLang = 'es'
      } else if (browserLanguage.startsWith('fr')) {
        detectedLang = 'fr'
      } else if (browserLanguage.startsWith('de')) {
        detectedLang = 'de'
      } else if (browserLanguage.startsWith('ar')) {
        detectedLang = 'ar'
      }
      
      setLanguageState(detectedLang)
      document.documentElement.lang = detectedLang
    }
    setIsLoading(false)
  }, [])

  // 언어 변경 함수 (애니메이션 포함)
  const setLanguage = useCallback((lang: LocaleKey) => {
    if (lang === language) return
    
    setIsTransitioning(true)
    
    setTimeout(() => {
      setLanguageState(lang)
      localStorage.setItem(STORAGE_KEY, lang)
      document.documentElement.lang = lang
      
      // RTL 언어 처리
      const langInfo = availableLanguages.find(l => l.code === lang)
      if (langInfo) {
        document.documentElement.dir = langInfo.direction
      }
      
      setIsTransitioning(false)
    }, 300)
  }, [language])

  // 날짜 포맷팅
  const formatDate = useCallback((date: Date, format: 'short' | 'medium' | 'long' = 'medium') => {
    const options: Intl.DateTimeFormatOptions = {
      short: { month: 'numeric', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' }
    }[format]
    
    return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : language === 'ar' ? 'ar-SA' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US', options).format(date)
  }, [language])

  // 숫자 포맷팅
  const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : language === 'ar' ? 'ar-SA' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US', options).format(num)
  }, [language])

  // 통화 포맷팅
  const formatCurrency = useCallback((amount: number, currency?: string) => {
    const currencyMap: Record<LocaleKey, string> = {
      ko: 'KRW',
      en: 'USD',
      ja: 'JPY',
      zh: 'CNY',
      es: 'EUR',
      fr: 'EUR',
      de: 'EUR',
      ar: 'SAR'
    }
    
    return new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : language === 'ar' ? 'ar-SA' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: currency || currencyMap[language] || 'USD'
    }).format(amount)
  }, [language])

  // 퍼센트 포맷팅
  const formatPercentage = useCallback((value: number) => {
    return new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : language === 'ar' ? 'ar-SA' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value / 100)
  }, [language])

  // 텍스트 방향 가져오기
  const getDirection = useCallback(() => {
    const langInfo = availableLanguages.find(l => l.code === language)
    return langInfo?.direction || 'ltr'
  }, [language])

  // 현재 언어의 번역 객체 (기본값 처리)
  const t = locales[language] || locales['en']

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading,
    availableLanguages: availableLanguages.filter(lang => 
      ['ko', 'en'].includes(lang.code) // 현재는 한국어와 영어만 지원
    ),
    isTransitioning,
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercentage,
    getDirection
  }

  return (
    <LanguageContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={language}
            initial={{ opacity: 0, y: isTransitioning ? 10 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isTransitioning ? -10 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </LanguageContext.Provider>
  )
}

// 훅으로 Context 사용
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 간편한 번역 훅
export const useTranslation = () => {
  const { t, language } = useLanguage()
  
  // 동적 번역 함수
  const translate = (key: string, variables?: Record<string, any>) => {
    let translation = key.split('.').reduce((obj: any, k) => obj?.[k], t) || key
    
    if (variables && typeof translation === 'string') {
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(`{{${varKey}}}`, String(value))
      })
    }
    
    return translation
  }
  
  return { t, translate, language }
}

// 언어별 폰트 설정 훅
export const useLanguageFont = () => {
  const { language } = useLanguage()
  
  const fontFamily = {
    ko: '"Noto Sans KR", "Malgun Gothic", sans-serif',
    en: '"Inter", "Roboto", sans-serif',
    ja: '"Noto Sans JP", "Hiragino Sans", sans-serif',
    zh: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
    ar: '"Noto Sans Arabic", "Tahoma", sans-serif',
    es: '"Roboto", sans-serif',
    fr: '"Roboto", sans-serif',
    de: '"Roboto", sans-serif'
  }[language] || '"Inter", sans-serif'
  
  return { fontFamily }
}

export default LanguageContext