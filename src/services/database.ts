import { Budget, Expense, Debt, DebtParticipant, DebtPayment, AlertSettings } from '../types';

class DatabaseService {
  private baseUrl = '/api';

  async saveBudgets(budgets: Budget[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgets })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save budgets');
      }
    } catch (error) {
      console.error('Error saving budgets to MongoDB:', error);
      // Fallback to localStorage
      localStorage.setItem('finance_tracker_budgets', JSON.stringify(budgets));
    }
  }

  async getBudgets(): Promise<Budget[]> {
    try {
      const response = await fetch(`${this.baseUrl}/budgets`);
      if (response.ok) {
        const data = await response.json();
        return data.budgets || [];
      }
    } catch (error) {
      console.error('Error loading budgets from MongoDB:', error);
    }
    
    // Fallback to localStorage
    try {
      const budgets = localStorage.getItem('finance_tracker_budgets');
      return budgets ? JSON.parse(budgets) : [];
    } catch {
      return [];
    }
  }

  async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save expenses');
      }
    } catch (error) {
      console.error('Error saving expenses to MongoDB:', error);
      localStorage.setItem('finance_tracker_expenses', JSON.stringify(expenses));
    }
  }

  async getExpenses(): Promise<Expense[]> {
    try {
      const response = await fetch(`${this.baseUrl}/expenses`);
      if (response.ok) {
        const data = await response.json();
        return data.expenses?.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        })) || [];
      }
    } catch (error) {
      console.error('Error loading expenses from MongoDB:', error);
    }
    
    // Fallback to localStorage
    try {
      const expenses = localStorage.getItem('finance_tracker_expenses');
      return expenses ? JSON.parse(expenses).map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      })) : [];
    } catch {
      return [];
    }
  }

  async saveDebts(debts: Debt[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/debts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debts })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save debts');
      }
    } catch (error) {
      console.error('Error saving debts to MongoDB:', error);
      localStorage.setItem('finance_tracker_debts', JSON.stringify(debts));
    }
  }

  async getDebts(): Promise<Debt[]> {
    try {
      const response = await fetch(`${this.baseUrl}/debts`);
      if (response.ok) {
        const data = await response.json();
        return data.debts?.map((debt: any) => ({
          ...debt,
          date: new Date(debt.date),
          dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
          payments: debt.payments?.map((payment: any) => ({
            ...payment,
            date: new Date(payment.date)
          })) || []
        })) || [];
      }
    } catch (error) {
      console.error('Error loading debts from MongoDB:', error);
    }
    
    // Fallback to localStorage
    try {
      const debts = localStorage.getItem('finance_tracker_debts');
      return debts ? JSON.parse(debts).map((debt: any) => ({
        ...debt,
        date: new Date(debt.date),
        dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
        payments: debt.payments?.map((payment: any) => ({
          ...payment,
          date: new Date(payment.date)
        })) || []
      })) : [];
    } catch {
      return [];
    }
  }

  async saveDebtParticipants(participants: DebtParticipant[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/debt-participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save debt participants');
      }
    } catch (error) {
      console.error('Error saving debt participants to MongoDB:', error);
      localStorage.setItem('finance_tracker_debt_participants', JSON.stringify(participants));
    }
  }

  async getDebtParticipants(): Promise<DebtParticipant[]> {
    try {
      const response = await fetch(`${this.baseUrl}/debt-participants`);
      if (response.ok) {
        const data = await response.json();
        return data.participants || [];
      }
    } catch (error) {
      console.error('Error loading debt participants from MongoDB:', error);
    }
    
    // Fallback to localStorage
    try {
      const participants = localStorage.getItem('finance_tracker_debt_participants');
      return participants ? JSON.parse(participants) : [];
    } catch {
      return [];
    }
  }

  async saveDebtPayments(payments: DebtPayment[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/debt-payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payments })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save debt payments');
      }
    } catch (error) {
      console.error('Error saving debt payments to MongoDB:', error);
      localStorage.setItem('finance_tracker_debt_payments', JSON.stringify(payments));
    }
  }

  async getDebtPayments(): Promise<DebtPayment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/debt-payments`);
      if (response.ok) {
        const data = await response.json();
        return data.payments?.map((payment: any) => ({
          ...payment,
          date: new Date(payment.date)
        })) || [];
      }
    } catch (error) {
      console.error('Error loading debt payments from MongoDB:', error);
    }
    
    // Fallback to localStorage
    try {
      const payments = localStorage.getItem('finance_tracker_debt_payments');
      return payments ? JSON.parse(payments).map((payment: any) => ({
        ...payment,
        date: new Date(payment.date)
      })) : [];
    } catch {
      return [];
    }
  }

  async saveAlertSettings(settings: AlertSettings): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/alert-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save alert settings');
      }
    } catch (error) {
      console.error('Error saving alert settings to MongoDB:', error);
      localStorage.setItem('finance_tracker_alert_settings', JSON.stringify(settings));
    }
  }

  async getAlertSettings(): Promise<AlertSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/alert-settings`);
      if (response.ok) {
        const data = await response.json();
        return data.settings || {
          budgetWarningThreshold: 80,
          enableSystemNotifications: true,
          weeklyReports: false,
        };
      }
    } catch (error) {
      console.error('Error loading alert settings from MongoDB:', error);
    }
    
    // Fallback to localStorage
    try {
      const settings = localStorage.getItem('finance_tracker_alert_settings');
      return settings ? JSON.parse(settings) : {
        budgetWarningThreshold: 80,
        enableSystemNotifications: true,
        weeklyReports: false,
      };
    } catch {
      return {
        budgetWarningThreshold: 80,
        enableSystemNotifications: true,
        weeklyReports: false,
      };
    }
  }

  async exportData(): Promise<string> {
    const data = {
      budgets: await this.getBudgets(),
      expenses: await this.getExpenses(),
      alertSettings: await this.getAlertSettings(),
      debts: await this.getDebts(),
      debtParticipants: await this.getDebtParticipants(),
      debtPayments: await this.getDebtPayments(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      if (data.budgets) await this.saveBudgets(data.budgets);
      if (data.expenses) await this.saveExpenses(data.expenses);
      if (data.alertSettings) await this.saveAlertSettings(data.alertSettings);
      if (data.debts) await this.saveDebts(data.debts);
      if (data.debtParticipants) await this.saveDebtParticipants(data.debtParticipants);
      if (data.debtPayments) await this.saveDebtPayments(data.debtPayments);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();