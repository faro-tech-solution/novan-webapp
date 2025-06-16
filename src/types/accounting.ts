export interface AccountingRecord {
  id: string;
  user_id: string;
  course_id?: string;
  amount: number;
  description?: string;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'waiting';
  payment_type: 'buy_course' | 'discount' | 'pay_money' | 'refund' | 'installment';
  transaction_date: string;
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  course?: {
    title: string;
  };
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
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'waiting';
  payment_type: 'buy_course' | 'discount' | 'pay_money' | 'refund' | 'installment';
  transaction_date: string;
}

export interface UpdatePaymentData {
  course_id?: string;
  amount?: number;
  description?: string;
  payment_method?: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_type?: 'buy_course' | 'discount' | 'pay_money' | 'refund' | 'installment';
} 