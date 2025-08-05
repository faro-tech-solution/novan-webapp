'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Password reset state
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [storedAccessToken, setStoredAccessToken] = useState<string | null>(
    null
  );
  const [storedRefreshToken, setStoredRefreshToken] = useState<string | null>(
    null
  );

  // Check for access token in URL hash for password reset
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    console.log("Current hash:", hash);

    if (hash) {
      // Check for access token
      if (hash.includes("access_token=")) {
        const accessToken = hash.split("access_token=")[1]?.split("&")[0];
        const refreshToken = hash.split("refresh_token=")[1]?.split("&")[0];
        console.log(
          "Extracted access token:",
          accessToken ? "present" : "missing"
        );
        console.log(
          "Extracted refresh token:",
          refreshToken ? "present" : "missing"
        );
        if (accessToken) {
          console.log("Access token found in URL, showing password reset form");
          setShowNewPasswordForm(true);
          setStoredAccessToken(accessToken);
          setStoredRefreshToken(refreshToken || "");
          return; // Don't process error parameters if we have a valid token
        }
      }

      // Check for error parameters only if no access token
      if (hash.includes("error=")) {
        const urlParams = new URLSearchParams(hash.substring(1)); // Remove the # and parse
        const error = urlParams.get("error");
        const errorCode = urlParams.get("error_code");
        const errorDescription = urlParams.get("error_description");

        console.log("Error found in URL:", {
          error,
          errorCode,
          errorDescription,
        });

        let errorMessage = "خطایی رخ داده است.";

        if (error === "access_denied") {
          if (errorCode === "otp_expired") {
            errorMessage =
              "لینک بازیابی رمز عبور منقضی شده است. لطفا دوباره درخواست کنید.";
          } else {
            errorMessage = "دسترسی رد شد. لطفا دوباره تلاش کنید.";
          }
        } else if (errorDescription) {
          errorMessage = decodeURIComponent(errorDescription);
        }

        toast({
          title: "خطا",
          description: errorMessage,
          variant: "destructive",
        });

        // Only clear the hash if there's an error, not if there's a valid token
        window.history.replaceState(null, "", "/forget_password");
      }
    }
  }, [toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: "خطا",
          description:
            error.message || "ارسال ایمیل بازیابی رمز عبور ناموفق بود.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "ایمیل ارسال شد",
          description: "لینک بازیابی رمز عبور به ایمیل شما ارسال شد.",
        });
        setEmailSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      toast({
        title: "رمز عبور ضعیف",
        description: "لطفا یک رمز عبور قوی انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطا",
        description: "رمزهای عبور مطابقت ندارند.",
        variant: "destructive",
      });
      return;
    }

    setUpdatePasswordLoading(true);
    try {
      // Use stored access token instead of extracting from URL
      const accessToken = storedAccessToken;
      const refreshToken = storedRefreshToken;
      console.log(
        "Password update - Using stored token:",
        accessToken ? "present" : "missing"
      );
      console.log(
        "Password update - Using stored refresh token:",
        refreshToken ? "present" : "missing"
      );

      if (!accessToken) {
        toast({
          title: "خطا",
          description: "لینک بازیابی نامعتبر است. لطفا دوباره درخواست کنید.",
          variant: "destructive",
        });
        return;
      }

      // Set the session using both access token and refresh token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          title: "خطا",
          description: "خطا در احراز هویت. لطفا دوباره تلاش کنید.",
          variant: "destructive",
        });
        return;
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password update error:", error);
        toast({
          title: "خطا",
          description: error.message || "تغییر رمز عبور ناموفق بود.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "رمز عبور تغییر یافت",
          description:
            "رمز عبور شما با موفقیت تغییر یافت. می‌توانید وارد شوید.",
        });
        setShowNewPasswordForm(false);
        setNewPassword("");
        setConfirmPassword("");
        setIsPasswordStrong(false);
        setStoredAccessToken(null);
        setStoredRefreshToken(null);
        // Clear the hash from URL and redirect to login
        window.history.replaceState(null, "", "/");
        router.push("/");
      }
    } finally {
      setUpdatePasswordLoading(false);
    }
  };

  // If showing password reset form, render that instead
  if (showNewPasswordForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-yekanbakh">تغییر رمز عبور</CardTitle>
              <CardDescription>رمز عبور جدید خود را وارد کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">رمز عبور جدید</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <PasswordStrengthMeter
                    password={newPassword}
                    onStrengthChange={setIsPasswordStrong}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">تأیید رمز عبور</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updatePasswordLoading || !isPasswordStrong}
                >
                  {updatePasswordLoading ? "در حال تغییر..." : "تغییر رمز عبور"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  // Show email sent confirmation
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-yekanbakh">ایمیل ارسال شد</CardTitle>
              <CardDescription>
                لینک بازیابی رمز عبور به ایمیل شما ارسال شد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  لطفا ایمیل خود را بررسی کنید و روی لینک بازیابی رمز عبور کلیک
                  کنید.
                </p>
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full"
                >
                  درخواست مجدد
                </Button>
                <div className="text-sm">
                  <Link href="/" className="text-teal-600 hover:text-teal-700">
                    بازگشت به صفحه ورود
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-yekanbakh">بازیابی رمز عبور</CardTitle>
            <CardDescription>
              ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <Link href="/" className="text-teal-600 hover:text-teal-700">
                بازگشت به صفحه ورود
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ForgetPassword;
