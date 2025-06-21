import { Budget, Expense, AlertSettings, Debt, DebtParticipant, DebtPayment } from '../types';
import { userDataService } from '../services/userDataService';
import { useAuth } from '../contexts/AuthContext';

// Fallback to localStorage for offline functionality
const STORAGE_KEYS = {
  BUDGETS: 'finance_tracker_budgets',
  EXPENSES: 'finance_tracker_expenses',
  ALERT_SETTINGS: 'finance_tracker_alert_settings',
  DEBTS: 'finance_tracker_debts',
  DEBT_PARTICIPANTS: 'finance_tracker_debt_participants',
  DEBT_PAYMENTS: 'finance_tracker_debt_payments',
};

class StorageUtils {
  private getCurrentUserId(): string | null {
    // This will be set by the component using this service
    return this.currentUserId;
  }

  private currentUserId: string | null = null;

  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  // Local storage fallback methods
  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToLocalStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Budget methods
  async getBudgets(): Promise<Budget[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return this.getFromLocalStorage(STORAGE_KEYS.BUDGETS, []);
    }

    try {
      return await userDataService.getBudgets(userId);
    } catch (error) {
      console.error('Error loading budgets from Firestore:', error);
      return this.getFromLocalStorage(STORAGE_KEYS.BUDGETS, []);
    }
  }

  async saveBudgets(budgets: Budget[]): Promise<void> {
    const userId = this.getCurrentUserId();
    
    // Always save to localStorage as backup
    this.saveToLocalStorage(STORAGE_KEYS.BUDGETS, budgets);
    
    if (!userId) {
      return;
    }

    try {
      await userDataService.saveBudgets(userId, budgets);
    } catch (error) {
      console.error('Error saving budgets to Firestore:', error);
    }
  }

  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      const expenses = this.getFromLocalStorage(STORAGE_KEYS.EXPENSES, []);
      return expenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
    }

    try {
      return await userDataService.getExpenses(userId);
    } catch (error) {
      console.error('Error loading expenses from Firestore:', error);
      const expenses = this.getFromLocalStorage(STORAGE_KEYS.EXPENSES, []);
      return expenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
    }
  }

  async saveExpenses(expenses: Expense[]): Promise<void> {
    const userId = this.getCurrentUserId();
    
    // Always save to localStorage as backup
    this.saveToLocalStorage(STORAGE_KEYS.EXPENSES, expenses);
    
    if (!userId) {
      return;
    }

    try {
      await userDataService.saveExpenses(userId, expenses);
    } catch (error) {
      console.error('Error saving expenses to Firestore:', error);
    }
  }

  // Alert Settings methods
  async getAlertSettings(): Promise<AlertSettings> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return this.getFromLocalStorage(STORAGE_KEYS.ALERT_SETTINGS, {
        budgetWarningThreshold: 80,
        enableSystemNotifications: true,
        weeklyReports: false,
      });
    }

    try {
      return await userDataService.getAlertSettings(userId);
    } catch (error) {
      console.error('Error loading alert settings from Firestore:', error);
      return this.getFromLocalStorage(STORAGE_KEYS.ALERT_SETTINGS, {
        budgetWarningThreshold: 80,
        enableSystemNotifications: true,
        weeklyReports: false,
      });
    }
  }

  async saveAlertSettings(settings: AlertSettings): Promise<void> {
    const userId = this.getCurrentUserId();
    
    // Always save to localStorage as backup
    this.saveToLocalStorage(STORAGE_KEYS.ALERT_SETTINGS, settings);
    
    if (!userId) {
      return;
    }

    try {
      await userDataService.saveAlertSettings(userId, settings);
    } catch (error) {
      console.error('Error saving alert settings to Firestore:', error);
    }
  }

  // Debt methods
  async getDebts(): Promise<Debt[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      const debts = this.getFromLocalStorage(STORAGE_KEYS.DEBTS, []);
      return debts.map((debt: any) => ({
        ...debt,
        date: new Date(debt.date),
        dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
        payments: debt.payments?.map((payment: any) => ({
          ...payment,
          date: new Date(payment.date)
        })) || []
      }));
    }

    try {
      return await userDataService.getDebts(userId);
    } catch (error) {
      console.error('Error loading debts from Firestore:', error);
      const debts = this.getFromLocalStorage(STORAGE_KEYS.DEBTS, []);
      return debts.map((debt: any) => ({
        ...debt,
        date: new Date(debt.date),
        dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
        payments: debt.payments?.map((payment: any) => ({
          ...payment,
          date: new Date(payment.date)
        })) || []
      }));
    }
  }

  async saveDebts(debts: Debt[]): Promise<void> {
    const userId = this.getCurrentUserId();
    
    // Always save to localStorage as backup
    this.saveToLocalStorage(STORAGE_KEYS.DEBTS, debts);
    
    if (!userId) {
      return;
    }

    try {
      await userDataService.saveDebts(userId, debts);
    } catch (error) {
      console.error('Error saving debts to Firestore:', error);
    }
  }

  // Debt Participants methods
  async getDebtParticipants(): Promise<DebtParticipant[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return this.getFromLocalStorage(STORAGE_KEYS.DEBT_PARTICIPANTS, []);
    }

    try {
      return await userDataService.getDebtParticipants(userId);
    } catch (error) {
      console.error('Error loading debt participants from Firestore:', error);
      return this.getFromLocalStorage(STORAGE_KEYS.DEBT_PARTICIPANTS, []);
    }
  }

  async saveDebtParticipants(participants: DebtParticipant[]): Promise<void> {
    const userId = this.getCurrentUserId();
    
    // Always save to localStorage as backup
    this.saveToLocalStorage(STORAGE_KEYS.DEBT_PARTICIPANTS, participants);
    
    if (!userId) {
      return;
    }

    try {
      await userDataService.saveDebtParticipants(userId, participants);
    } catch (error) {
      console.error('Error saving debt participants to Firestore:', error);
    }
  }

  // Debt Payments methods
  async getDebtPayments(): Promise<DebtPayment[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      const payments = this.getFromLocalStorage(STORAGE_KEYS.DEBT_PAYMENTS, []);
      return payments.map((payment: any) => ({
        ...payment,
        date: new Date(payment.date)
      }));
    }

    try {
      return await userDataService.getDebtPayments(userId);
    } catch (error) {
      console.error('Error loading debt payments from Firestore:', error);
      const payments = this.getFromLocalStorage(STORAGE_KEYS.DEBT_PAYMENTS, []);
      return payments.map((payment: any) => ({
        ...payment,
        date: new Date(payment.date)
      }));
    }
  }

  async saveDebtPayments(payments: DebtPayment[]): Promise<void> {
    const userId = this.getCurrentUserId();
    
    // Always save to localStorage as backup
    this.saveToLocalStorage(STORAGE_KEYS.DEBT_PAYMENTS, payments);
    
    if (!userId) {
      return;
    }

    try {
      await userDataService.saveDebtPayments(userId, payments);
    } catch (error) {
      console.error('Error saving debt payments to Firestore:', error);
    }
  }

  // Export/Import methods
  async exportData(): Promise<string> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      // Export from localStorage
      const data = {
        budgets: this.getFromLocalStorage(STORAGE_KEYS.BUDGETS, []),
        expenses: this.getFromLocalStorage(STORAGE_KEYS.EXPENSES, []),
        alertSettings: this.getFromLocalStorage(STORAGE_KEYS.ALERT_SETTINGS, {}),
        debts: this.getFromLocalStorage(STORAGE_KEYS.DEBTS, []),
        debtParticipants: this.getFromLocalStorage(STORAGE_KEYS.DEBT_PARTICIPANTS, []),
        debtPayments: this.getFromLocalStorage(STORAGE_KEYS.DEBT_PAYMENTS, []),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    }

    try {
      return await userDataService.exportUserData(userId);
    } catch (error) {
      console.error('Error exporting data from Firestore:', error);
      // Fallback to localStorage export
      const data = {
        budgets: this.getFromLocalStorage(STORAGE_KEYS.BUDGETS, []),
        expenses: this.getFromLocalStorage(STORAGE_KEYS.EXPENSES, []),
        alertSettings: this.getFromLocalStorage(STORAGE_KEYS.ALERT_SETTINGS, {}),
        debts: this.getFromLocalStorage(STORAGE_KEYS.DEBTS, []),
        debtParticipants: this.getFromLocalStorage(STORAGE_KEYS.DEBT_PARTICIPANTS, []),
        debtPayments: this.getFromLocalStorage(STORAGE_KEYS.DEBT_PAYMENTS, []),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    }
  }

  async importData(jsonData: string): Promise<boolean> {
    const userId = this.getCurrentUserId();
    
    try {
      const data = JSON.parse(jsonData);
      
      if (!userId) {
        // Import to localStorage
        if (data.budgets) this.saveToLocalStorage(STORAGE_KEYS.BUDGETS, data.budgets);
        if (data.expenses) this.saveToLocalStorage(STORAGE_KEYS.EXPENSES, data.expenses);
        if (data.alertSettings) this.saveToLocalStorage(STORAGE_KEYS.ALERT_SETTINGS, data.alertSettings);
        if (data.debts) this.saveToLocalStorage(STORAGE_KEYS.DEBTS, data.debts);
        if (data.debtParticipants) this.saveToLocalStorage(STORAGE_KEYS.DEBT_PARTICIPANTS, data.debtParticipants);
        if (data.debtPayments) this.saveToLocalStorage(STORAGE_KEYS.DEBT_PAYMENTS, data.debtPayments);
        return true;
      }

      return await userDataService.importUserData(userId, jsonData);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storageUtils = new StorageUtils();