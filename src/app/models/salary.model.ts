export interface Salary {
  id: string;
  amount: number;
  month: string; // Format: 'YYYY-MM' (e.g., '2025-01')
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type NewSalaryInput = Omit<Salary, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSalaryInput = Partial<Omit<Salary, 'id' | 'createdAt'>> & { id: string };
