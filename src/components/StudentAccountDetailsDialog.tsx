import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStudentRecordsQuery } from '@/hooks/useAccountingQuery';
import { formatDate } from '@/lib/utils';

interface StudentAccountDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const getAmountColor = (paymentType: string) => {
  switch (paymentType) {
    case 'buy_course':
      return 'text-red-600';
    case 'discount':
      return 'text-green-600';
    default:
      return 'text-blue-600';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">تکمیل شده</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">در انتظار</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-800">ناموفق</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function StudentAccountDetailsDialog({
  open,
  onOpenChange,
  userId,
  userName
}: StudentAccountDetailsDialogProps) {
  const { data: records, isLoading, error } = useStudentRecordsQuery(userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>جزئیات حساب {userName}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center py-4">در حال بارگذاری...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">خطا در دریافت اطلاعات</div>
        ) : records?.length === 0 ? (
          <div className="text-center py-4">هیچ تراکنشی یافت نشد</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تاریخ</TableHead>
                <TableHead>نوع تراکنش</TableHead>
                <TableHead>دوره</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>توضیحات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.transaction_date)}</TableCell>
                  <TableCell>{record.payment_type}</TableCell>
                  <TableCell>{record.course?.name || '-'}</TableCell>
                  <TableCell className={getAmountColor(record.payment_type)}>
                    {record.amount.toLocaleString('fa-IR')} تومان
                  </TableCell>
                  <TableCell>{getStatusBadge(record.payment_status)}</TableCell>
                  <TableCell>{record.description || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
} 