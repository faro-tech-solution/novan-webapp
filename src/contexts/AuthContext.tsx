import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "trainer" | "trainee" | "admin" | "teammate";

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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      // Only process significant auth changes after initial load
      if (isInitialized && event === "TOKEN_REFRESHED") {
        console.log("Token refreshed, not updating user state");
        return;
      }

      setSession(session);

      // Only update user state if there's a meaningful change
      const newUser = session?.user ?? null;
      if (newUser?.id !== user?.id) {
        setUser(newUser);

        if (newUser) {
          // Defer profile fetching to avoid potential deadlocks
          setTimeout(() => {
            fetchProfile(newUser.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }

      if (!initialCheckDone) {
        setLoading(false);
        setIsInitialized(true);
        initialCheckDone = true;
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }

      setLoading(false);
      setIsInitialized(true);
      initialCheckDone = true;
    });

    return () => subscription.unsubscribe();
  }, [user?.id, isInitialized]);

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
    const redirectUrl = `${window.location.origin}/`;

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
    const redirectUrl = `${window.location.origin}/forget_password`;
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
