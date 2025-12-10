
export interface UserData {
  email: string;
  balance: number;
  adsWatchedToday: number;
  lastAdWatchDate: string; // YYYY-MM-DD
  role: 'user' | 'admin';
}

export interface AdHistoryItem {
  id: string;
  timestamp: number;
  reward: number;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  uid: string;
  email: string;
  amount: number;
  method: 'Easypaisa' | 'Jazzcash';
  accountInfo: string;
  status: WithdrawalStatus;
  timestamp: number;
}
