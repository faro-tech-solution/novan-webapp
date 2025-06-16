import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { accountingService } from '@/services/accountingService';
import { useToast } from '@/hooks/use-toast';
import { AccountingWithDetails } from '@/types/accounting';

interface StudentAccountDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function StudentAccountDetailsDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: StudentAccountDetailsDialogProps) {
  const [records, setRecords] = useState<AccountingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open && userId) {
      fetchStudentRecords();
    }
  }, [open, userId]);

  const fetchStudentRecords = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await accountingService.getUserRecords(userId);
      setRecords(data);
    } catch (error: any) {
      console.error('Error fetching student records:', error);
      toast({
        title: "خطا",
        description: error.message || 'خطا در دریافت اطلاعات تراکنش‌ها',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'در انتظار', variant: 'secondary' },
      completed: { label: 'تکمیل شده', variant: 'default' },
      failed: { label: 'ناموفق', variant: 'destructive' },
    };

    const { label, variant } = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPaymentTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      buy_course: { label: 'خرید دوره', variant: 'default' },
      discount: { label: 'تخفیف', variant: 'secondary' },
      pay_money: { label: 'پرداخت', variant: 'outline' },
      refund: { label: 'بازپرداخت', variant: 'destructive' },
      installment: { label: 'اقساط', variant: 'default' },
    };

    const { label, variant } = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const calculateBalance = () => {
    return records.reduce((sum, record) => {
      if (record.payment_type === 'installment' && record.payment_status === 'waiting') {
        return sum;
      }
      return sum + record.amount;
    }, 0);
  };

  const getAmountColor = (paymentType: string) => {
    switch (paymentType) {
      case 'buy_course':
        return 'text-red-500';
      case 'discount':
        return 'text-yellow-500';
      case 'pay_money':
        return 'text-green-500';
      case 'refund':
        return 'text-amber-700';
      case 'installment':
        return 'text-orange-500';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>جزئیات حساب {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-lg">
              <span className="font-semibold">بالانس حساب: </span>
              <span className={calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatAmount(calculateBalance())}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">در حال بارگذاری...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">نوع تراکنش</TableHead>
                  <TableHead className="text-right">دوره</TableHead>
                  <TableHead className="text-right">مبلغ</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">روش پرداخت</TableHead>
                  <TableHead className="text-right">توضیحات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-right">
                      {new Date(record.created_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {getPaymentTypeBadge(record.payment_type)}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.course?.name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={getAmountColor(record.payment_type)}>
                        {formatAmount(record.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(record.payment_status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.payment_method}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.description || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 