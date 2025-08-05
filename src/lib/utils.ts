import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment";
import "moment/locale/fa";
import jMoment from "moment-jalaali";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate({
  dateString,
  format = 'jYYYY/jMM/jDD - HH:mm',
  locale = 'fa',
}: {
  dateString: string;
  format?: string;
  locale?: string;
}) {
  if (locale === 'fa') {
    return jMoment(dateString).locale('fa').format(format);
  }
  return moment(dateString).format('LLL');
}

export function formatNumber(number: number, locale = 'fa-IR') {
  return new Intl.NumberFormat(locale).format(number)
}

// Map language code to locale
export function getLocale(language: string) {
  return language === 'fa' ? 'fa-IR' : 'en-US'
}
