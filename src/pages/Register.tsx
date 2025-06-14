
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('trainee');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await register(name, email, password, role);
      if (error) {
        toast({
          title: "خطا در ثبت نام",
          description: error.message || 'ثبت نام ناموفق بود',
          variant: "destructive",
        });
      } else {
        toast({
          title: "ثبت نام موفق",
          description: "لطفا ایمیل خود را بررسی کنید و حساب کاربری را تایید کنید.",
        });
        navigate('/login');
      }
    } catch (err) {
      toast({
        title: "خطا",
        description: 'ثبت نام ناموفق. لطفا دوباره تلاش کنید.',
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
            <CardDescription>
              در پلتفرم یادگیری ما عضو شوید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">نام کامل</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
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
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">نقش</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="نقش خود را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trainee">دانشجو</SelectItem>
                    <SelectItem value="trainer">مربی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">قبلا ثبت نام کرده‌اید؟ </span>
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
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
