import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountingService } from '@/services/accountingService';
import type { AccountingWithDetails, CreatePaymentData } from '@/types/accounting';
import { StudentBalance } from '@/types/student';

interface FinancialReport {
  totalSales: number;
  totalDiscounts: number;
  totalIncome: number;
  totalReceived: number;
  totalReceivable: number;
  pendingInstallments: number;
}

const processAccountingData = (data: AccountingWithDetails[]): { balances: StudentBalance[], report: FinancialReport } => {
  const balances = new Map<string, StudentBalance>();
  const financialReport: FinancialReport = {
    totalSales: 0,
    totalDiscounts: 0,
    totalIncome: 0,
    totalReceived: 0,
    totalReceivable: 0,
    pendingInstallments: 0,
  };

  data.forEach(record => {
    const userId = record.user.id;
    if (!balances.has(userId)) {
      balances.set(userId, {
        user: record.user,
        balance: 0
      });
    }

    // Only add to balance if it's not a pending installment
    if (!(record.payment_type === 'installment' && record.payment_status === 'waiting')) {
      balances.get(userId)!.balance += record.amount;
    }

    // Update financial report
    if (record.payment_type === 'buy_course') {
      financialReport.totalSales += Math.abs(record.amount);
    } else if (record.payment_type === 'discount') {
      financialReport.totalDiscounts += Math.abs(record.amount);
    }

    // Only count positive payments that are not discounts and not incomplete installments
    if (record.amount > 0 && 
        record.payment_type !== 'discount' && 
        !(record.payment_type === 'installment' && record.payment_status === 'waiting')) {
      financialReport.totalReceived += record.amount;
    }

    // Track pending installments
    if (record.payment_type === 'installment' && record.payment_status === 'waiting') {
      financialReport.pendingInstallments += record.amount;
    }
  });

  // Calculate total income and receivables
  financialReport.totalIncome = financialReport.totalSales - financialReport.totalDiscounts;
  financialReport.totalReceivable = financialReport.totalIncome - financialReport.totalReceived;

  return {
    balances: Array.from(balances.values()),
    report: financialReport
  };
};

export const useAccountingRecordsQuery = () => {
  return useQuery({
    queryKey: ['accounting-records'],
    queryFn: async () => {
      const data = await accountingService.getAllRecords();
      return processAccountingData(data);
    }
  });
};

export const useStudentRecordsQuery = (userId: string) => {
  return useQuery({
    queryKey: ['student-records', userId],
    queryFn: () => accountingService.getStudentRecords(userId),
    enabled: !!userId
  });
};

export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData: CreatePaymentData) => accountingService.createPayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-records'] });
    }
  });
}; 