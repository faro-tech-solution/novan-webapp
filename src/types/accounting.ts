import { SubmissionStudent } from './student';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'waiting';
export type PaymentType = 'buy_course' | 'discount' | 'pay_money' | 'refund' | 'installment';

export interface AccountingRecord {
  id: string;
  user_id: string;
  course_id: string | null;
  amount: number;
  payment_type: 'buy_course' | 'discount' | 'installment' | 'refund';
  payment_status: 'completed' | 'waiting' | 'cancelled';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountingWithDetails extends AccountingRecord {
  user: SubmissionStudent & { id: string; role?: string; is_demo?: boolean };
  course: {
    id: string;
    name: string;
  } | null;
}

export interface CreatePaymentData {
  user_id: string;
  course_id?: string;
  amount: number;
  payment_type: PaymentType;
  payment_status?: PaymentStatus;
  payment_method?: string;
  description?: string;
  transaction_date?: string;
}

export interface UpdatePaymentData {
  course_id?: string;
  amount?: number;
  description?: string;
  payment_method?: string;
  payment_status?: PaymentStatus;
  payment_type?: PaymentType;
} 