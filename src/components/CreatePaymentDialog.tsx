import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { accountingService } from '@/services/accountingService';
import type { CreatePaymentData } from '@/types/accounting';

const paymentFormSchema = z.object({
  user_id: z.string().min(1, 'انتخاب کاربر الزامی است'),
  course_id: z.string().optional(),
  amount: z.number().min(1, 'مبلغ باید بیشتر از صفر باشد'),
  description: z.string().optional(),
  payment_method: z.string().optional(),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('completed'),
  payment_type: z.enum(['buy_course', 'discount', 'pay_money', 'refund']).default('pay_money'),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentCreated: () => void;
  userId?: string;
  userName?: string;
}

const CreatePaymentDialog = ({ 
  open, 
  onOpenChange, 
  onPaymentCreated,
  userId,
  userName 
}: CreatePaymentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      user_id: userId || '',
      amount: 0,
      payment_status: 'completed',
      payment_type: 'pay_money',
    },
  });

  // Update form when userId changes
  useEffect(() => {
    if (userId) {
      form.setValue('user_id', userId);
    }
  }, [userId, form]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      const paymentData: CreatePaymentData = {
        user_id: data.user_id,
        course_id: data.course_id,
        amount: data.amount,
        description: data.description,
        payment_method: data.payment_method || 'cash',
        payment_status: data.payment_status,
        payment_type: data.payment_type,
      };
      await accountingService.createPayment(paymentData);
      toast({
        title: 'ثبت پرداخت',
        description: 'پرداخت با موفقیت ثبت شد',
      });
      form.reset();
      onPaymentCreated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در ثبت پرداخت',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ثبت پرداخت جدید</DialogTitle>
          <DialogDescription>
            {userName ? `ثبت پرداخت برای ${userName}` : 'اطلاعات پرداخت جدید را وارد کنید'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!userId && (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شناسه کاربر</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شناسه دوره (اختیاری)</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-right" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ (ریال)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>روش پرداخت</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-right" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع پرداخت</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="نوع پرداخت را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="buy_course">خرید دوره</SelectItem>
                      <SelectItem value="discount">تخفیف</SelectItem>
                      <SelectItem value="pay_money">پرداخت نقدی</SelectItem>
                      <SelectItem value="refund">مسترد کردن</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-right" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                لغو
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'در حال ثبت...' : 'ثبت پرداخت'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentDialog; 