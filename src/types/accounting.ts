export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'waiting';
export type PaymentType = 'buy_course' | 'discount' | 'pay_money' | 'refund' | 'installment';

export interface AccountingRecord {
  id: string;
  user_id: string;
  course_id?: string;
  amount: number;
  description?: string;
  payment_method?: string;
  payment_status: PaymentStatus;
  payment_type: PaymentType;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  course?: {
    id: string;
    name: string;
  } | null;
}

export interface AccountingWithDetails extends AccountingRecord {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  course: {
    id: string;
    name: string;
  } | null;
}

export interface CreatePaymentData {
  user_id: string;
  course_id?: string;
  amount: number;
  description?: string;
  payment_method?: string;
  payment_status: PaymentStatus;
  payment_type: PaymentType;
  transaction_date: string;
}

export interface UpdatePaymentData {
  course_id?: string;
  amount?: number;
  description?: string;
  payment_method?: string;
  payment_status?: PaymentStatus;
  payment_type?: PaymentType;
} 