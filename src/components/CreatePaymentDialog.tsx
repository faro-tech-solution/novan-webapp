import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreatePaymentMutation } from '@/hooks/useAccountingQuery';
import type { PaymentType } from '@/types/accounting';

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onPaymentCreated: () => void;
}

export default function CreatePaymentDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onPaymentCreated
}: CreatePaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('pay_money');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const createPaymentMutation = useCreatePaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !paymentType || !paymentMethod) {
      toast({
        title: 'خطا',
        description: 'لطفا تمام فیلدهای الزامی را پر کنید',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPaymentMutation.mutateAsync({
        user_id: userId,
        amount: parseInt(amount),
        payment_type: paymentType,
        payment_method: paymentMethod,
        description: description || undefined,
        payment_status: 'completed',
        transaction_date: new Date().toISOString(),
      });

      toast({
        title: 'موفقیت',
        description: 'پرداخت با موفقیت ثبت شد',
      });

      // Reset form
      setAmount('');
      setPaymentType('pay_money');
      setPaymentMethod('');
      setDescription('');

      onPaymentCreated();
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در ثبت پرداخت',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ثبت پرداخت جدید برای {userName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">مبلغ (تومان)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مبلغ را وارد کنید"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentType">نوع پرداخت</Label>
            <Select value={paymentType} onValueChange={(value: PaymentType) => setPaymentType(value)} required>
              <SelectTrigger>
                <SelectValue placeholder="نوع پرداخت را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pay_money">پرداخت</SelectItem>
                <SelectItem value="refund">بازپرداخت</SelectItem>
                <SelectItem value="discount">تخفیف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">روش پرداخت</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="روش پرداخت را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">نقدی</SelectItem>
                <SelectItem value="bank_transfer">انتقال بانکی</SelectItem>
                <SelectItem value="online">آنلاین</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">توضیحات (اختیاری)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات را وارد کنید"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? 'در حال ثبت...' : 'ثبت پرداخت'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 