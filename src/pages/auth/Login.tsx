import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Add debugging logs
  console.log("Login component - profile:", profile);

  // Redirect if already logged in
  useEffect(() => {
    if (profile) {
      console.log("Redirecting user with role:", profile.role);
      if (profile.role === "trainer") {
        navigate("/dashboard/trainer");
      } else if (profile.role === "trainee") {
        navigate("/dashboard/trainee");
      } else if (profile.role === "admin") {
        navigate("/dashboard/admin");
      } else if (profile.role === "teammate") {
        navigate("/dashboard/teammate");
      }
    }
  }, [profile, navigate]);

  // Redirect from /login to / for backward compatibility
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting login...");
      const { error } = await login(email, password);
      if (error) {
        console.error("Login error:", error);
        toast({
          title: "خطا در ورود",
          description: error.message || "اطلاعات نادرست است",
          variant: "destructive",
        });
      } else {
        console.log("Login successful");
        toast({
          title: "ورود موفق",
          description: "به داشبورد منتقل می‌شوید...",
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
            <CardTitle className="font-peyda">ورود</CardTitle>
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
                    to="/forget_password"
                    className="text-xs text-teal-600 hover:text-teal-700 underline"
                  >
                    رمز عبور را فراموش کرده‌اید؟
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">حساب ندارید؟ </span>
              <Link
                to="/register"
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
