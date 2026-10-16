export interface Expense {
  id: string;
  amount: number;
  date: number;
}

export interface GiftCard {
  id: string;
  name: string;
  description: string;
  initialAmount: number;
  balance: number;
  expenses: Expense[];
  createdAt: number;
  color?: string;
  isShared?: boolean;
  // Secret that authorises remote edits; only stored on the owner's device.
  editToken?: string;
}
