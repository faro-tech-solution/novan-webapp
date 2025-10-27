'use client';

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
import { getDashboardPathForRole } from "@/utils";
import { TurnstileCaptcha, TurnstileCaptchaRef } from "@/components/auth/TurnstileCaptcha";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined);
  const captchaRef = useRef<TurnstileCaptchaRef>(null);
  const { login, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Add debugging logs
  console.log("Login component - profile:", profile);

  // Redirect if already logged in
  useEffect(() => {
    if (!profile) return;
    // If redirected from a protected route, go back to that route
    const from = searchParams?.get('from');
    if (from) {
      router.replace(decodeURIComponent(from));
      return;
    }
    // Otherwise, go to dashboard by role
    router.replace(getDashboardPathForRole(profile.role));
  }, [profile, router]);

  // Redirect from /login to /portal/login for backward compatibility
  useEffect(() => {
    if (pathname === "/login") {
      router.replace("/portal/login");
    }
  }, [pathname, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      toast({
        title: "تایید امنیتی",
        description: "لطفا تایید امنیتی را کامل کنید",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login...");
      const { error } = await login(email, password, captchaToken);
      if (error) {
        console.error("Login error:", error);
        toast({
          title: "خطا در ورود",
          description: error.message || "اطلاعات نادرست است",
          variant: "destructive",
        });
        // Reset CAPTCHA on error
        captchaRef.current?.reset();
        setCaptchaToken(undefined);
      } else {
        console.log("Login successful");
        toast({
          title: "ورود موفق",
          description: "در حال انتقال...",
        });
        // Note: The redirect will happen automatically via the useEffect above
        // once the profile is loaded from the AuthContext
      }
    } catch (err) {
      console.error("Login catch error:", err);
      toast({
        title: "خطا",
        description: "ورود ناموفق. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
      // Reset CAPTCHA on error
      captchaRef.current?.reset();
      setCaptchaToken(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-yekanbakh">ورود</CardTitle>
            <CardDescription>
              اطلاعات خود را وارد کنید تا به داشبورد دسترسی پیدا کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="text-left mt-1">
                  <Link
                    href="/portal/forget_password"
                    className="text-xs text-teal-600 hover:text-teal-700 underline"
                  >
                    رمز عبور را فراموش کرده‌اید؟
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <Label>تایید امنیتی</Label>
                <TurnstileCaptcha
                  ref={captchaRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onVerify={setCaptchaToken}
                  onError={(error) => {
                    console.error('CAPTCHA error:', error);
                    toast({
                      title: "خطا در تایید امنیتی",
                      description: "لطفا دوباره تلاش کنید",
                      variant: "destructive",
                    });
                  }}
                  onExpire={() => {
                    setCaptchaToken(undefined);
                    toast({
                      title: "تایید امنیتی منقضی شد",
                      description: "لطفا دوباره تایید کنید",
                      variant: "destructive",
                    });
                  }}
                  className="flex justify-center"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
                {loading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">حساب ندارید؟ </span>
              <Link
                href="/portal/register"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                ثبت نام
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
