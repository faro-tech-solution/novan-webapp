import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';

const profileFormSchema = z.object({
  first_name: z.string().min(1, 'نام الزامی است'),
  last_name: z.string().min(1, 'نام خانوادگی الزامی است'),
  gender: z.string().optional(),
  job: z.string().optional(),
  education: z.string().optional(),
  phone_number: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  birthday: z.string().optional(),
  ai_familiarity: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  english_level: z.enum(['beginner', 'intermediate', 'advanced', 'native']).optional(),
  telegram_id: z.string().optional(),
  whatsapp_id: z.string().optional(),
});

const passwordFormSchema = z.object({
  current_password: z.string().min(1, 'رمز عبور فعلی الزامی است'),
  new_password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  confirm_password: z.string().min(1, 'تکرار رمز عبور الزامی است'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "رمز عبور و تکرار آن مطابقت ندارند",
  path: ["confirm_password"],
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

const Profile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      gender: profile?.gender || '',
      job: profile?.job || '',
      education: profile?.education || '',
      phone_number: profile?.phone_number || '',
      country: profile?.country || '',
      city: profile?.city || '',
      birthday: profile?.birthday || '',
      ai_familiarity: profile?.ai_familiarity || undefined,
      english_level: profile?.english_level || undefined,
      telegram_id: profile?.telegram_id || '',
      whatsapp_id: profile?.whatsapp_id || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender,
          job: data.job,
          education: data.education,
          phone_number: data.phone_number,
          country: data.country,
          city: data.city,
          birthday: data.birthday,
          ai_familiarity: data.ai_familiarity,
          english_level: data.english_level,
          telegram_id: data.telegram_id,
          whatsapp_id: data.whatsapp_id,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "پروفایل بروزرسانی شد",
        description: "اطلاعات پروفایل شما با موفقیت بروزرسانی شد.",
      });
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || 'خطا در بروزرسانی پروفایل',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;
    
    if (!isPasswordStrong) {
      toast({
        title: "رمز عبور ضعیف",
        description: "لطفا یک رمز عبور قوی انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.current_password,
      });

      if (signInError) throw new Error('رمز عبور فعلی اشتباه است');

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (updateError) throw updateError;

      toast({
        title: "رمز عبور بروزرسانی شد",
        description: "رمز عبور شما با موفقیت بروزرسانی شد.",
      });

      // Reset form
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || 'خطا در بروزرسانی رمز عبور',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="پروفایل">
      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">اطلاعات پروفایل</TabsTrigger>
            <TabsTrigger value="password">تغییر رمز عبور</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" dir="rtl">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات پروفایل</CardTitle>
                <CardDescription>
                  اطلاعات شخصی خود را بروزرسانی کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نام خانوادگی</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نام</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>جنسیت</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="job"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>شغل</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="education"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تحصیلات</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="phone_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>شماره تماس</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>کشور</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>شهر</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="birthday"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تاریخ تولد</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="ai_familiarity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>سطح آشنایی با هوش مصنوعی</FormLabel>
                              <FormControl>
                                <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-right">
                                  <option value="">انتخاب کنید</option>
                                  <option value="beginner">مبتدی</option>
                                  <option value="intermediate">متوسط</option>
                                  <option value="advanced">پیشرفته</option>
                                  <option value="expert">متخصص</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="english_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>سطح زبان انگلیسی</FormLabel>
                              <FormControl>
                                <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-right">
                                  <option value="">انتخاب کنید</option>
                                  <option value="beginner">مبتدی</option>
                                  <option value="intermediate">متوسط</option>
                                  <option value="advanced">پیشرفته</option>
                                  <option value="native">بومی</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="telegram_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>شناسه تلگرام</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6">
                        <FormField
                          control={profileForm.control}
                          name="whatsapp_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>شناسه واتساپ</FormLabel>
                              <FormControl>
                                <Input {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'در حال بروزرسانی...' : 'بروزرسانی پروفایل'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" dir="rtl">
            <Card>
              <CardHeader>
                <CardTitle>تغییر رمز عبور</CardTitle>
                <CardDescription>
                  رمز عبور خود را تغییر دهید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="current_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رمز عبور فعلی</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="text-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رمز عبور جدید</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="text-right" />
                          </FormControl>
                          <PasswordStrengthMeter 
                            password={field.value} 
                            onStrengthChange={setIsPasswordStrong}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تکرار رمز عبور جدید</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="text-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={loading || !isPasswordStrong} className="w-full">
                      {loading ? 'در حال بروزرسانی...' : 'بروزرسانی رمز عبور'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile; 