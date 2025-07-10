import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const { error } = await register(
        firstName,
        lastName,
        email,
        password,
        "trainee"
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
        navigate("/");
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
            <CardTitle className="font-peyda">ثبت نام</CardTitle>
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
                disabled={loading || !isPasswordStrong}
              >
                {loading ? "در حال ثبت نام..." : "ثبت نام"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">قبلا ثبت نام کرده‌اید؟ </span>
              <Link
                to="/"
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
