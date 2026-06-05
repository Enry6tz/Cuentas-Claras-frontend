import type { UserPublic } from './users';
import type { TripSummary } from './pagination';

export type ExpenseSplitType = 'EQUAL' | 'EXACT' | 'PERCENT';

export interface ExpenseDetail {
  id: string;
  expenseId: string;
  userId: string;
  amountPaid: string;
  amountOwed: string;
  user?: UserPublic;
}

export interface Expense {
  id: string;
  creatorId: string;
  tripId: string;
  description: string | null;
  originalAmount: string;
  originalCurrency: string;
  exchangeRate: string | null;
  baseAmount: string | null;
  splitType: ExpenseSplitType;
  date: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  details?: ExpenseDetail[];
  creator?: UserPublic;
  // Presente en la lista global (GET /me/expenses).
  trip?: TripSummary;
}

export interface MyExpensesFilters {
  page?: number;
  limit?: number;
  tripId?: string;
  category?: string;
  q?: string;
  from?: string;
  to?: string;
}

export interface CreateExpensePayload {
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  date?: string;
  category?: string;
  splitType: ExpenseSplitType;
  payers: Array<{ userId: string; amountPaid: number }>;
  participantIds?: string[];
  exactShares?: Array<{ userId: string; amountOwed: number }>;
  percentShares?: Array<{ userId: string; percent: number }>;
  manualExchangeRate?: number;
}
