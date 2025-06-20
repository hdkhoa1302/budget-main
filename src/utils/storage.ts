import { Budget, Expense, AlertSettings, Debt, DebtParticipant, DebtPayment } from '../types';
import { databaseService } from '../services/database';

const STORAGE_KEYS = {
  BUDGETS: 'finance_tracker_budgets',
  EXPENSES: 'finance_tracker_expenses',
  ALERT_SETTINGS: 'finance_tracker_alert_settings',
  DEBTS: 'finance_tracker_debts',
  DEBT_PARTICIPANTS: 'finance_tracker_debt_participants',
  DEBT_PAYMENTS: 'finance_tracker_debt_payments',
};

export const storageUtils = {
  getBudgets: async (): Promise<Budget[]> => {
    return await databaseService.getBudgets();
  },

  saveBudgets: async (budgets: Budget[]) => {
    await databaseService.saveBudgets(budgets);
  },

  getExpenses: async (): Promise<Expense[]> => {
    return await databaseService.getExpenses();
  },

  saveExpenses: async (expenses: Expense[]) => {
    await databaseService.saveExpenses(expenses);
  },

  getAlertSettings: async (): Promise<AlertSettings> => {
    return await databaseService.getAlertSettings();
  },

  saveAlertSettings: async (settings: AlertSettings) => {
    await databaseService.saveAlertSettings(settings);
  },

  // Debt Management
  getDebts: async (): Promise<Debt[]> => {
    return await databaseService.getDebts();
  },

  saveDebts: async (debts: Debt[]) => {
    await databaseService.saveDebts(debts);
  },

  getDebtParticipants: async (): Promise<DebtParticipant[]> => {
    return await databaseService.getDebtParticipants();
  },

  saveDebtParticipants: async (participants: DebtParticipant[]) => {
    await databaseService.saveDebtParticipants(participants);
  },

  getDebtPayments: async (): Promise<DebtPayment[]> => {
    return await databaseService.getDebtPayments();
  },

  saveDebtPayments: async (payments: DebtPayment[]) => {
    await databaseService.saveDebtPayments(payments);
  },

  exportData: async (): Promise<string> => {
    return await databaseService.exportData();
  },

  importData: async (jsonData: string): Promise<boolean> => {
    return await databaseService.importData(jsonData);
  },
};