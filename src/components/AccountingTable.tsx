import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountingRecord } from "@/types/accounting";
import { formatDate } from "@/lib/utils";

interface AccountingTableProps {
  records: AccountingRecord[];
}

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

export function AccountingTable({ records }: AccountingTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>کاربر</TableHead>
            <TableHead>دوره</TableHead>
            <TableHead>مبلغ</TableHead>
            <TableHead>توضیحات</TableHead>
            <TableHead>روش پرداخت</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>نوع</TableHead>
            <TableHead>تاریخ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                {record.user?.first_name} {record.user?.last_name}
              </TableCell>
              <TableCell>{record.course?.title || '-'}</TableCell>
              <TableCell className="text-right font-medium">
                <span className={getAmountColor(record.payment_type)}>
                  {record.amount.toLocaleString('fa-IR')} تومان
                </span>
              </TableCell>
              <TableCell>{record.description || '-'}</TableCell>
              <TableCell>{record.payment_method || '-'}</TableCell>
              <TableCell>{record.payment_status}</TableCell>
              <TableCell>{record.payment_type}</TableCell>
              <TableCell>{formatDate(record.transaction_date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 