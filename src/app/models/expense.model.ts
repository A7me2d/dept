export type PaymentMethod = 'cash' | 'card' | 'digital_wallet';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewExpenseInput = Omit<Expense, 'id' | 'archived' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseInput = Partial<Omit<Expense, 'id' | 'createdAt'>> & { id: string };
