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
