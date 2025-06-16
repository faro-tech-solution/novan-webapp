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
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded', 'waiting']).default('completed'),
  payment_type: z.enum(['buy_course', 'discount', 'pay_money', 'refund', 'installment']).default('pay_money'),
  transaction_date: z.string().min(1, 'تاریخ تراکنش الزامی است'),
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

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      user_id: userId || '',
      course_id: '',
      amount: 0,
      description: '',
      payment_method: '',
      payment_status: 'completed',
      payment_type: 'pay_money',
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  // Add watch for payment_type changes
  const paymentType = form.watch('payment_type');

  // Update payment_status when payment_type changes
  useEffect(() => {
    if (paymentType === 'installment') {
      form.setValue('payment_status', 'waiting');
    } else {
      form.setValue('payment_status', 'completed');
    }
  }, [paymentType, form]);

  // Update form when userId changes
  useEffect(() => {
    if (userId) {
      form.setValue('user_id', userId);
    }
  }, [userId, form]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      if (!data.user_id) {
        toast({
          title: "خطا",
          description: "لطفا کاربر را انتخاب کنید",
          variant: "destructive",
        });
        return;
      }

      const paymentData: CreatePaymentData = {
        user_id: data.user_id,
        course_id: data.course_id || undefined,
        amount: data.amount,
        description: data.description || undefined,
        payment_method: data.payment_method || undefined,
        payment_status: data.payment_status,
        payment_type: data.payment_type,
        transaction_date: data.transaction_date,
      };

      await accountingService.createPayment(paymentData);
      
      toast({
        title: "موفق",
        description: "پرداخت با موفقیت ثبت شد",
      });
      
      onPaymentCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "خطا",
        description: "خطا در ثبت پرداخت",
        variant: "destructive",
      });
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
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاریخ تراکنش</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
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
                      <SelectItem value="installment">پرداخت اقساطی</SelectItem>
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