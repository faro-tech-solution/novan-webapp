import { supabase } from '@/integrations/supabase/client';
import type { AccountingRecord, AccountingWithDetails, CreatePaymentData, UpdatePaymentData } from '@/types/accounting';

export const accountingService = {
  // Get all accounting records with user and course details
  async getAllRecords(): Promise<AccountingWithDetails[] | any[]> {
    const { data, error } = await supabase
      .from('accounting')
      .select(`
        *,
        user:profiles(id, first_name, last_name, email, role, is_demo),
        course:courses(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get accounting records for a specific user
  async getUserRecords(userId: string): Promise<AccountingWithDetails[] | any[]> {
    const { data, error } = await supabase
      .from('accounting')
      .select(`
        *,
        user:profiles(id, first_name, last_name, email, role, is_demo),
        course:courses(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user's current balance
  async getUserBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('accounting')
      .select('amount')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).reduce((sum, record) => sum + record.amount, 0);
  },

  // Create a new payment record
  async createPayment(paymentData: CreatePaymentData): Promise<AccountingRecord | any> {
    const { data, error } = await supabase
      .from('accounting')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create payment record');
    return data;
  },

  // Update a payment record
  async updatePayment(id: string, paymentData: UpdatePaymentData): Promise<AccountingRecord | any> {
    const { data, error } = await supabase
      .from('accounting')
      .update(paymentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update payment record');
    return data;
  },

  // Get payment record by ID
  async getPaymentById(id: string): Promise<AccountingWithDetails | any> {
    const { data, error } = await supabase
      .from('accounting')
      .select(`
        *,
        user:profiles(id, first_name, last_name, email, role, is_demo),
        course:courses(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Payment record not found');
    return data;
  },

  // Get payment records by course ID
  async getCoursePayments(courseId: string): Promise<AccountingWithDetails[] | any[]> {
    const { data, error } = await supabase
      .from('accounting')
      .select(`
        *,
        user:profiles(id, first_name, last_name, email, role, is_demo),
        course:courses(id, name)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get student records for a specific student
  async getStudentRecords(userId: string): Promise<AccountingWithDetails[] | any[]> {
    const { data, error } = await supabase
      .from('accounting')
      .select(`
        *,
        user:profiles!accounting_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        course:courses!accounting_course_id_fkey (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  }
}; 