import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Language = "fa" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Default language is Farsi
  const [language, setLanguageState] = useState<Language>("fa");
  const { profile, user } = useAuth();

  // Load language preference from user profile when authenticated
  useEffect(() => {
    if (profile?.language_preference) {
      setLanguageState(profile.language_preference as Language);
    }
  }, [profile]);

  // Handle HTML dir attribute for RTL/LTR layout
  useEffect(() => {
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // Update language preference in profile
  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);

    // Update the language preference in Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ language_preference: newLanguage } as any)
          .eq("id", user.id);

        if (error) {
          console.error("Error updating language preference:", error);
        }
      } catch (error) {
        console.error("Error updating language preference:", error);
      }
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRTL: language === "fa",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
