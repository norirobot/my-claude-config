import ko from './ko-clean'
import en from './en-clean'

export const locales = {
  ko,
  en
}

export type LocaleKey = keyof typeof locales
export type TranslationKeys = typeof ko

// 언어 목록
export const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
] as const

export default locales