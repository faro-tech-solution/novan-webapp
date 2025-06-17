import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentAccountDetailsDialog } from '@/components/StudentAccountDetailsDialog';
import CreatePaymentDialog from '@/components/CreatePaymentDialog';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useAccountingRecordsQuery } from '@/hooks/useAccountingQuery';

interface SelectedStudent {
  id: string;
  name: string;
  email: string;
}

const Accounting = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error } = useAccountingRecordsQuery();
  const { balances: records = [], report } = data || { balances: [], report: {
    totalSales: 0,
    totalDiscounts: 0,
    totalIncome: 0,
    totalReceived: 0,
    totalReceivable: 0,
    pendingInstallments: 0,
  }};

  // Add search filter
  const filteredRecords = searchQuery.trim() === '' 
    ? records 
    : records.filter(record => {
        const fullName = `${record.user.first_name} ${record.user.last_name}`.toLowerCase();
        const email = record.user.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  return (
    <DashboardLayout title="حسابداری">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اقساط در انتظار پرداخت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatAmount(report.pendingInstallments)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>لیست دانشجویان</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس نام یا ایمیل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-right"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">در حال بارگذاری...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">خطا در دریافت اطلاعات</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-4">
              {records.length === 0 ? 'هیچ دانشجویی یافت نشد' : 'هیچ دانشجویی با این فیلتر یافت نشد'}
            </div>
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
                {filteredRecords.map((record) => (
                  <TableRow key={record.user.id}>
                    <TableCell className="text-right">{record.user.first_name} {record.user.last_name}</TableCell>
                    <TableCell className="text-right">{record.user.email}</TableCell>
                    <TableCell className="text-right">
                      <span className={record.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatAmount(record.balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-start gap-2">
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
            setIsCreateDialogOpen(false);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Accounting; 