export type CategoryDTO = {
  id: string;
  key: string;
  label: string;
  icon: string;
  color: string;
};

export type ReactionDTO = {
  id: string;
  expenseId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; role: 'OWNER' | 'MONITOR' };
};

export type ExpenseDTO = {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  category: CategoryDTO;
  description: string | null;
  occurredAt: string;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_BANKING' | 'OTHER';
  travelFrom: string | null;
  travelTo: string | null;
  transportType: string | null;
  createdAt: string;
  updatedAt: string;
  reactions: ReactionDTO[];
};

export type QuickActionDTO = {
  id: string;
  label: string;
  amount: number;
  categoryId: string;
  category: CategoryDTO;
};
