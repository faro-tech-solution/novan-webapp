import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitch: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  // Toggle between 'fa' and 'en'
  const toggleLanguage = async () => {
    const newLanguage = language === "fa" ? "en" : "fa";
    await setLanguage(newLanguage);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-gray-700 hover:text-teal-600"
    >
      {language === "fa" ? "English" : "فارسی"}
    </Button>
  );
};
