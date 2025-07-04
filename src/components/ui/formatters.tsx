import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/lib/utils";

interface DateFormatterProps {
  date: string | Date;
  format?: Intl.DateTimeFormatOptions;
}

export const DateFormatter: React.FC<DateFormatterProps> = ({
  date,
  format = { year: "numeric", month: "long", day: "numeric" },
}) => {
  const { language } = useLanguage();
  const locale = getLocale(language);

  const formattedDate = new Date(date).toLocaleDateString(locale, format);

  return <>{formattedDate}</>;
};

interface NumberFormatterProps {
  value: number;
  options?: Intl.NumberFormatOptions;
}

export const NumberFormatter: React.FC<NumberFormatterProps> = ({
  value,
  options = {},
}) => {
  const { language } = useLanguage();
  const locale = getLocale(language);

  const formattedNumber = new Intl.NumberFormat(locale, options).format(value);

  return <>{formattedNumber}</>;
};
