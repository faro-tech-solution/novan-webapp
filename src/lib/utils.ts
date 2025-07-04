import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, locale = 'fa-IR') {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatNumber(number: number, locale = 'fa-IR') {
  return new Intl.NumberFormat(locale).format(number)
}

// Map language code to locale
export function getLocale(language: string) {
  return language === 'fa' ? 'fa-IR' : 'en-US'
}
