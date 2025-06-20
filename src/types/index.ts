export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
}

export interface Budget {
  id: string;
  monthlyIncome: number;
  categories: BudgetCategory[];
  totalAllocated: number;
  totalSpent: number;
  month: string;
  year: number;
}

export interface AlertSettings {
  budgetWarningThreshold: number;
  enableSystemNotifications: boolean;
  weeklyReports: boolean;
}

export interface ExpenseFormData {
  amount: string;
  categoryId: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
}

// Debt Management Types
export interface DebtParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface DebtSplit {
  participantId: string;
  amount: number;
  isPaid: boolean;
  paidDate?: Date;
}

export interface Debt {
  id: string;
  type: 'lend' | 'borrow' | 'group_payment' | 'group_receive';
  title: string;
  description?: string;
  totalAmount: number;
  date: Date;
  dueDate?: Date;
  status: 'active' | 'partially_paid' | 'completed' | 'overdue';
  
  // For simple lending/borrowing
  participantId?: string;
  paidAmount?: number;
  
  // For group payments
  splits?: DebtSplit[];
  splitType?: 'equal' | 'custom';
  
  // Payment history
  payments?: DebtPayment[];
  
  notes?: string;
  attachments?: string[];
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: Date;
  participantId?: string; // For group payments
  notes?: string;
}

export interface DebtFormData {
  type: 'lend' | 'borrow' | 'group_payment' | 'group_receive';
  title: string;
  description?: string;
  totalAmount: string;
  date: string;
  dueDate?: string;
  participantId?: string;
  participants?: DebtParticipant[];
  splitType?: 'equal' | 'custom';
  customSplits?: { participantId: string; amount: string }[];
  notes?: string;
}