import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { locales, LocaleKey, TranslationKeys } from '../locales'

interface LanguageContextType {
  language: LocaleKey
  setLanguage: (lang: LocaleKey) => void
  t: TranslationKeys
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | null>(null)

interface LanguageProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'ai-english-tutor-language'

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LocaleKey>('ko')
  const [isLoading, setIsLoading] = useState(true)

  // 로컬 스토리지에서 언어 설정 불러오기
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as LocaleKey
    if (savedLanguage && locales[savedLanguage]) {
      setLanguageState(savedLanguage)
    } else {
      // 브라우저 언어 감지
      const browserLanguage = navigator.language.toLowerCase()
      if (browserLanguage.startsWith('ko')) {
        setLanguageState('ko')
      } else {
        setLanguageState('en')
      }
    }
    setIsLoading(false)
  }, [])

  // 언어 변경 함수
  const setLanguage = (lang: LocaleKey) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  // 현재 언어의 번역 객체
  const t = locales[language]

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
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
  const { t } = useLanguage()
  return { t }
}

export default LanguageContext