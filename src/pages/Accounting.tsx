import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentAccountDetailsDialog } from '@/components/StudentAccountDetailsDialog';
import CreatePaymentDialog from '@/components/CreatePaymentDialog';
import { accountingService } from '@/services/accountingService';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

interface StudentBalance {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  balance: number;
}

interface SelectedStudent {
  id: string;
  name: string;
  email: string;
}

interface FinancialReport {
  totalSales: number;
  totalDiscounts: number;
  totalIncome: number;
  totalReceived: number;
  totalReceivable: number;
}

const Accounting = () => {
  const [records, setRecords] = useState<StudentBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [report, setReport] = useState<FinancialReport>({
    totalSales: 0,
    totalDiscounts: 0,
    totalIncome: 0,
    totalReceived: 0,
    totalReceivable: 0,
  });
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountingService.getAllRecords();
      const balances = new Map<string, StudentBalance>();
      const financialReport: FinancialReport = {
        totalSales: 0,
        totalDiscounts: 0,
        totalIncome: 0,
        totalReceived: 0,
        totalReceivable: 0,
      };

      data.forEach(record => {
        const userId = record.user.id;
        if (!balances.has(userId)) {
          balances.set(userId, {
            user: record.user,
            balance: 0
          });
        }
        balances.get(userId)!.balance += record.amount;

        // Update financial report
        if (record.payment_type === 'buy_course') {
          financialReport.totalSales += Math.abs(record.amount);
        } else if (record.payment_type === 'discount') {
          financialReport.totalDiscounts += Math.abs(record.amount);
        }

        // Only count positive payments that are not discounts
        if (record.amount > 0 && record.payment_type !== 'discount') {
          financialReport.totalReceived += record.amount;
        }
      });

      // Calculate total income and receivables
      financialReport.totalIncome = financialReport.totalSales - financialReport.totalDiscounts;
      financialReport.totalReceivable = financialReport.totalIncome - financialReport.totalReceived;

      setRecords(Array.from(balances.values()));
      setReport(financialReport);
    } catch (err) {
      setError('خطا در دریافت اطلاعات');
      toast({
        title: 'خطا',
        description: 'خطا در دریافت اطلاعات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout title="حسابداری">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل فروش</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAmount(report.totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تخفیف ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatAmount(report.totalDiscounts)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبلغ کل درآمد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAmount(report.totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبلغ دریافت شده</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAmount(report.totalReceived)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبلغ بستانکار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatAmount(report.totalReceivable)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست دانشجویان</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">در حال بارگذاری...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : records.length === 0 ? (
            <div className="text-center py-4">هیچ دانشجویی یافت نشد</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">ایمیل</TableHead>
                  <TableHead className="text-right">موجودی</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.user.id}>
                    <TableCell className="text-right">{record.user.first_name} {record.user.last_name}</TableCell>
                    <TableCell className="text-right">{record.user.email}</TableCell>
                    <TableCell className="text-right">
                      <span className={record.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatAmount(record.balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent({ 
                            id: record.user.id, 
                            name: `${record.user.first_name} ${record.user.last_name}`,
                            email: record.user.email 
                          })}
                        >
                          مشاهده جزئیات حساب
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent({ 
                              id: record.user.id, 
                              name: `${record.user.first_name} ${record.user.last_name}`,
                              email: record.user.email 
                            });
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          ثبت پرداخت جدید
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <StudentAccountDetailsDialog
          open={!!selectedStudent}
          onOpenChange={(open) => !open && setSelectedStudent(null)}
          userId={selectedStudent.id}
          userName={`${selectedStudent.name} (${selectedStudent.email})`}
        />
      )}

      {selectedStudent && (
        <CreatePaymentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          userId={selectedStudent.id}
          userName={selectedStudent.name}
          onPaymentCreated={() => {
            fetchRecords();
            setIsCreateDialogOpen(false);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Accounting; 