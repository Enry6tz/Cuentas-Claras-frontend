// Barrel de tipos. Las interfaces viven en src/types/{dominio}.ts (una por
// dominio); este archivo sólo re-exporta para mantener los imports `@/types`.

export type { User, UserPublic } from './users';
export type { ParticipationRole, Participation } from './participants';
export type { TripStatus, Trip, TripPayload, UpdateTripPayload } from './trips';
export type {
  InvitationStatus,
  Invitation,
  CreateInvitationBody,
} from './invitations';
export type {
  ExpenseSplitType,
  ExpenseDetail,
  Expense,
  CreateExpensePayload,
  MyExpensesFilters,
} from './expenses';
export type { Payment, CreatePaymentPayload, MyPaymentsFilters } from './payments';
export type { Paginated, TripSummary } from './pagination';
export type { BalanceEntry, SettlementSuggestion } from './balances';
export type { ActivityItem, DashboardData } from './dashboard';
export type { CurrencyRate } from './currency';

// Envelope legacy del backend. Con el BFF, el route handler desenvuelve el
// `{ data }`, así que el frontend ya no lo necesita; se mantiene por compat.
export interface ApiResponse<T> {
  data: T;
}
