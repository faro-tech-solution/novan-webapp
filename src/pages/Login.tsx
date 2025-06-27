import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, profile, user, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  // Password reset state
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);

  // Add debugging logs
  console.log('Login component - profile:', profile);
  console.log('Login component - user:', user);

  // Check for access token in URL hash for password reset
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      // Check for access token
      if (hash.includes('access_token=')) {
        const accessToken = hash.split('access_token=')[1]?.split('&')[0];
        if (accessToken) {
          console.log('Access token found in URL, showing password reset form');
          setShowNewPasswordForm(true);
        }
      }
      
      // Check for error parameters
      if (hash.includes('error=')) {
        const urlParams = new URLSearchParams(hash.substring(1)); // Remove the # and parse
        const error = urlParams.get('error');
        const errorCode = urlParams.get('error_code');
        const errorDescription = urlParams.get('error_description');
        
        console.log('Error found in URL:', { error, errorCode, errorDescription });
        
        let errorMessage = 'خطایی رخ داده است.';
        
        if (error === 'access_denied') {
          if (errorCode === 'otp_expired') {
            errorMessage = 'لینک بازیابی رمز عبور منقضی شده است. لطفا دوباره درخواست کنید.';
          } else {
            errorMessage = 'دسترسی رد شد. لطفا دوباره تلاش کنید.';
          }
        } else if (errorDescription) {
          errorMessage = decodeURIComponent(errorDescription);
        }
        
        toast({
          title: 'خطا',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // Clear the hash from URL
        window.history.replaceState(null, '', '/');
      }
    }
  }, [location.hash, toast]);

  // Redirect if already logged in
  useEffect(() => {
    if (profile && !showNewPasswordForm) {
      console.log('Redirecting user with role:', profile.role);
      if (profile.role === 'trainer') {
        navigate('/dashboard/trainer');
      } else if (profile.role === 'trainee') {
        navigate('/dashboard/trainee');
      } else if (profile.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (profile.role === 'teammate') {
        navigate('/dashboard/teammate');
      }
    }
  }, [profile, navigate, showNewPasswordForm]);

  // Redirect from /login to / for backward compatibility
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login...');
      const { error } = await login(email, password);
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "خطا در ورود",
          description: error.message || 'اطلاعات نادرست است',
          variant: "destructive",
        });
      } else {
        console.log('Login successful');
        toast({
          title: "ورود موفق",
          description: "به داشبورد منتقل می‌شوید...",
        });
        // Note: The redirect will happen automatically via the useEffect above
        // once the profile is loaded from the AuthContext
      }
    } catch (err) {
      console.error('Login catch error:', err);
      toast({
        title: "خطا",
        description: 'ورود ناموفق. لطفا دوباره تلاش کنید.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        toast({
          title: 'خطا',
          description: error.message || 'ارسال ایمیل بازیابی رمز عبور ناموفق بود.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'ایمیل ارسال شد',
          description: 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد.',
        });
        setShowResetDialog(false);
        setResetEmail('');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordStrong) {
      toast({
        title: 'رمز عبور ضعیف',
        description: 'لطفا یک رمز عبور قوی انتخاب کنید',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'خطا',
        description: 'رمزهای عبور مطابقت ندارند.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatePasswordLoading(true);
    try {
      // Extract access token from URL hash
      const hash = location.hash;
      const accessToken = hash.split('access_token=')[1]?.split('&')[0];
      
      if (!accessToken) {
        toast({
          title: 'خطا',
          description: 'لینک بازیابی نامعتبر است.',
          variant: 'destructive',
        });
        return;
      }

      // Set the session using the access token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // We don't have refresh token from URL
      });

      if (sessionError) {
        toast({
          title: 'خطا',
          description: 'خطا در احراز هویت. لطفا دوباره تلاش کنید.',
          variant: 'destructive',
        });
        return;
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: 'خطا',
          description: error.message || 'تغییر رمز عبور ناموفق بود.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'رمز عبور تغییر یافت',
          description: 'رمز عبور شما با موفقیت تغییر یافت. می‌توانید وارد شوید.',
        });
        setShowNewPasswordForm(false);
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordStrong(false);
        // Clear the hash from URL
        window.history.replaceState(null, '', '/');
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
              <CardTitle className="font-peyda">تغییر رمز عبور</CardTitle>
              <CardDescription>
                رمز عبور جدید خود را وارد کنید
              </CardDescription>
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
                  {updatePasswordLoading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                </Button>
              </form>
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
                  <button
                    type="button"
                    className="text-xs text-teal-600 hover:text-teal-700 underline"
                    onClick={() => setShowResetDialog(true)}
                  >
                    رمز عبور را فراموش کرده‌اید؟
                  </button>
                </div>
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

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>بازیابی رمز عبور</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">ایمیل</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={resetLoading} className="w-full">
                {resetLoading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
