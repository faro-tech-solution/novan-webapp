import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "trainer" | "trainee" | "admin";

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  classId?: string;
  className?: string;
  gender?: string;
  job?: string;
  education?: string;
  phone_number?: string;
  country?: string;
  city?: string;
  birthday?: string;
  ai_familiarity?: "beginner" | "intermediate" | "advanced" | "expert";
  english_level?: "beginner" | "intermediate" | "advanced" | "native";
  telegram_id?: string;
  whatsapp_id?: string;
  language_preference?: "fa" | "en" | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
  isInitialized: boolean;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const currentUserIdRef = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // If profile doesn't exist, create a basic one
        if (error.code === "PGRST116") {
          console.log("Profile not found, will be created by trigger");
          return;
        }
        return;
      }

      console.log("Profile data 111:", data);

      if (data) {
        console.log("Profile fetched successfully:", data);
        setProfile({
          id: data.id,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          role: data.role as UserRole,
          classId: data.class_id || undefined,
          className: data.class_name || undefined,
          gender: data.gender || undefined,
          job: data.job || undefined,
          education: data.education || undefined,
          phone_number: data.phone_number || undefined,
          country: data.country || undefined,
          city: data.city || undefined,
          birthday: data.birthday || undefined,
          ai_familiarity:
            (data.ai_familiarity as
              | "beginner"
              | "intermediate"
              | "advanced"
              | "expert") || undefined,
          english_level:
            (data.english_level as
              | "beginner"
              | "intermediate"
              | "advanced"
              | "native") || undefined,
          telegram_id: data.telegram_id || undefined,
          whatsapp_id: data.whatsapp_id || undefined,
          language_preference: (data as any).language_preference === "en" ? "en" : "fa",
        });
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener...");

    let initialCheckDone = false;

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.id);

      // Ignore token refresh noise entirely to prevent user/profile flicker
      if (event === "TOKEN_REFRESHED") {
        setSession(newSession);
        return;
      }

      setSession(newSession);

      const newUser = newSession?.user ?? null;
      const previousUserId = currentUserIdRef.current;

      // If auth event is sign-out, clear state and stop loading
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        currentUserIdRef.current = null;
        setLoading(false);
        if (!initialCheckDone) {
          setIsInitialized(true);
          initialCheckDone = true;
        }
        return;
      }

      // If user identity changed, reload profile and then clear loading
      if (newUser?.id !== previousUserId) {
        setLoading(true);
        setUser(newUser);
        currentUserIdRef.current = newUser?.id ?? null;
        if (newUser) {
          await fetchProfile(newUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }

      if (!initialCheckDone) {
        setIsInitialized(true);
        initialCheckDone = true;
      }
    });

    // Check for existing session (await profile fetch before clearing loading)
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id);

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      currentUserIdRef.current = currentUser?.id ?? null;

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
      setIsInitialized(true);
      initialCheckDone = true;
    })();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Login attempt for:", email);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
    } else {
      console.log("Login successful");
    }

    return { error };
  };

  const register = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name,
          last_name,
          role,
        },
      },
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    // Redirect to forget password page
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/forget_password` : '/forget_password';
    console.log("Password reset redirect URL:", redirectUrl);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        login,
        register,
        logout,
        loading,
        isInitialized,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
