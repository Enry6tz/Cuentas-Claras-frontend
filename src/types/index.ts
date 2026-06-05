export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export type TripStatus = 'ACTIVE' | 'FINALIZED';
export type ParticipationRole = 'CREATOR' | 'SUPERVISOR' | 'MEMBER';
export type ExpenseSplitType = 'EQUAL' | 'EXACT' | 'PERCENT';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Participation {
  id: string;
  userId: string;
  tripId: string;
  role: ParticipationRole;
  currentBalance: string;
  joinedAt: string;
  user?: UserPublic;
}

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  baseCurrency: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  participations?: Participation[];
  _count?: {
    participations: number;
    expenses: number;
  };
}

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
}

export interface Payment {
  id: string;
  debtorId: string;
  creditorId: string;
  tripId: string;
  amount: string;
  note: string | null;
  date: string;
  createdAt: string;
  debtor?: UserPublic;
  creditor?: UserPublic;
}

export interface BalanceEntry {
  userId: string;
  userName: string;
  balance: string;
}

export interface SettlementSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: string;
}

export interface ActivityItem {
  type: 'expense' | 'payment' | 'trip';
  description: string | null;
  amount: string;
  tripName: string;
  tripId: string;
  date: string;
}

export interface Invitation {
  id: string;
  tripId: string;
  invitedId: string;
  invitedBy: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  invited?: UserPublic;
  inviter?: UserPublic;
  trip?: {
    id: string;
    name: string;
    baseCurrency?: string;
  };
}

// Todas las respuestas de la API vienen envueltas en { data: ... }
// (lo hace el TransformInterceptor global del backend en main.ts).
export interface ApiResponse<T> {
  data: T;
}
