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
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useRecaptcha } from "@/hooks/useRecaptcha";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Check if we're in production (captcha required)
  const isProduction = process.env.NODE_ENV === 'production';
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const { executeRecaptcha, status: recaptchaStatus, error: recaptchaError } = useRecaptcha(
    isProduction ? recaptchaSiteKey : undefined
  );

  useEffect(() => {
    if (recaptchaError) {
      toast({
        title: "خطا در تایید امنیتی",
        description: recaptchaError,
        variant: "destructive",
      });
    }
  }, [recaptchaError, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      toast({
        title: "رمز عبور ضعیف",
        description: "لطفا یک رمز عبور قوی انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    if (password !== repeatPassword) {
      toast({
        title: "رمز عبور مطابقت ندارد",
        description: "رمز عبور و تکرار آن باید یکسان باشند",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let captchaToken: string | undefined;

      if (isProduction) {
        if (!recaptchaSiteKey) {
          throw new Error("کلید reCAPTCHA تنظیم نشده است.");
        }

        if (recaptchaStatus !== 'ready') {
          throw new Error("reCAPTCHA هنوز آماده نیست. لطفا چند لحظه صبر کنید و دوباره تلاش کنید.");
        }

        captchaToken = await executeRecaptcha('register');
      }

      const { error } = await register(
        firstName,
        lastName,
        email,
        password,
        "trainee",
        captchaToken
      );
      if (error) {
        toast({
          title: "خطا در ثبت نام",
          description: error.message || "ثبت نام ناموفق بود",
          variant: "destructive",
        });
      } else {
        toast({
          title: "ثبت نام موفق",
          description:
            "لطفا ایمیل خود را بررسی کنید و حساب کاربری را تایید کنید.",
        });
        router.push("/portal/login");
      }
    } catch {
      toast({
        title: "خطا",
        description: "ثبت نام ناموفق. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
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
            <CardTitle className="font-yekanbakh">ثبت نام</CardTitle>
            <CardDescription>در پلتفرم یادگیری ما عضو شوید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 space-y-2">
                  <Label htmlFor="firstName">نام</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-6 space-y-2">
                  <Label htmlFor="lastName">نام خانوادگی</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                <PasswordStrengthMeter
                  password={password}
                  onStrengthChange={setIsPasswordStrong}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeatPassword">تکرار رمز عبور</Label>
                <Input
                  id="repeatPassword"
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !isPasswordStrong ||
                  (isProduction && recaptchaStatus !== 'ready')
                }
              >
                {loading ? "در حال ثبت نام..." : "ثبت نام"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">قبلا ثبت نام کرده‌اید؟ </span>
              <Link
                href={"/portal/login"}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                ورود
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
