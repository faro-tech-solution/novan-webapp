
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await login(email, password);
      if (error) {
        toast({
          title: "خطا در ورود",
          description: error.message || 'اطلاعات نادرست است',
          variant: "destructive",
        });
      } else {
        toast({
          title: "ورود موفق",
          description: "به داشبورد منتقل می‌شوید...",
        });
        navigate('/dashboard');
      }
    } catch (err) {
      toast({
        title: "خطا",
        description: 'ورود ناموفق. لطفا دوباره تلاش کنید.',
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
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'در حال ورود...' : 'ورود'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">حساب ندارید؟ </span>
              <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
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
