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
}
