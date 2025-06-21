import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  updateDoc,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Budget, Expense, Debt, DebtParticipant, DebtPayment, AlertSettings } from '../types';

class UserDataService {
  private getUserCollection(userId: string, collectionName: string) {
    return collection(db, 'users', userId, collectionName);
  }

  private getUserDoc(userId: string, collectionName: string, docId: string) {
    return doc(db, 'users', userId, collectionName, docId);
  }

  // Budget Management
  async saveBudgets(userId: string, budgets: Budget[]): Promise<void> {
    const batch = writeBatch(db);
    const budgetsRef = this.getUserCollection(userId, 'budgets');
    
    // Clear existing budgets first
    const existingBudgets = await getDocs(budgetsRef);
    existingBudgets.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new budgets
    budgets.forEach((budget) => {
      const budgetRef = doc(budgetsRef, budget.id);
      batch.set(budgetRef, {
        ...budget,
        updatedAt: new Date()
      });
    });

    await batch.commit();
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    try {
      const budgetsRef = this.getUserCollection(userId, 'budgets');
      const snapshot = await getDocs(query(budgetsRef, orderBy('year', 'desc'), orderBy('month', 'desc')));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
    } catch (error) {
      console.error('Error getting budgets:', error);
      return [];
    }
  }

  async saveBudget(userId: string, budget: Budget): Promise<void> {
    const budgetRef = this.getUserDoc(userId, 'budgets', budget.id);
    await setDoc(budgetRef, {
      ...budget,
      updatedAt: new Date()
    });
  }

  async deleteBudget(userId: string, budgetId: string): Promise<void> {
    const budgetRef = this.getUserDoc(userId, 'budgets', budgetId);
    await deleteDoc(budgetRef);
  }

  // Expense Management
  async saveExpenses(userId: string, expenses: Expense[]): Promise<void> {
    const batch = writeBatch(db);
    const expensesRef = this.getUserCollection(userId, 'expenses');
    
    // Clear existing expenses first
    const existingExpenses = await getDocs(expensesRef);
    existingExpenses.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new expenses
    expenses.forEach((expense) => {
      const expenseRef = doc(expensesRef, expense.id);
      batch.set(expenseRef, {
        ...expense,
        date: expense.date.toISOString(),
        updatedAt: new Date()
      });
    });

    await batch.commit();
  }

  async getExpenses(userId: string): Promise<Expense[]> {
    try {
      const expensesRef = this.getUserCollection(userId, 'expenses');
      const snapshot = await getDocs(query(expensesRef, orderBy('date', 'desc')));
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: new Date(data.date)
        };
      }) as Expense[];
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async saveExpense(userId: string, expense: Expense): Promise<void> {
    const expenseRef = this.getUserDoc(userId, 'expenses', expense.id);
    await setDoc(expenseRef, {
      ...expense,
      date: expense.date.toISOString(),
      updatedAt: new Date()
    });
  }

  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    const expenseRef = this.getUserDoc(userId, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  }

  // Debt Management
  async saveDebts(userId: string, debts: Debt[]): Promise<void> {
    const batch = writeBatch(db);
    const debtsRef = this.getUserCollection(userId, 'debts');
    
    // Clear existing debts first
    const existingDebts = await getDocs(debtsRef);
    existingDebts.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new debts
    debts.forEach((debt) => {
      const debtRef = doc(debtsRef, debt.id);
      batch.set(debtRef, {
        ...debt,
        date: debt.date.toISOString(),
        dueDate: debt.dueDate?.toISOString(),
        payments: debt.payments?.map(payment => ({
          ...payment,
          date: payment.date.toISOString()
        })),
        splits: debt.splits?.map(split => ({
          ...split,
          paidDate: split.paidDate?.toISOString()
        })),
        updatedAt: new Date()
      });
    });

    await batch.commit();
  }

  async getDebts(userId: string): Promise<Debt[]> {
    try {
      const debtsRef = this.getUserCollection(userId, 'debts');
      const snapshot = await getDocs(query(debtsRef, orderBy('date', 'desc')));
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: new Date(data.date),
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          payments: data.payments?.map((payment: any) => ({
            ...payment,
            date: new Date(payment.date)
          })) || [],
          splits: data.splits?.map((split: any) => ({
            ...split,
            paidDate: split.paidDate ? new Date(split.paidDate) : undefined
          })) || []
        };
      }) as Debt[];
    } catch (error) {
      console.error('Error getting debts:', error);
      return [];
    }
  }

  async saveDebt(userId: string, debt: Debt): Promise<void> {
    const debtRef = this.getUserDoc(userId, 'debts', debt.id);
    await setDoc(debtRef, {
      ...debt,
      date: debt.date.toISOString(),
      dueDate: debt.dueDate?.toISOString(),
      payments: debt.payments?.map(payment => ({
        ...payment,
        date: payment.date.toISOString()
      })),
      splits: debt.splits?.map(split => ({
        ...split,
        paidDate: split.paidDate?.toISOString()
      })),
      updatedAt: new Date()
    });
  }

  async deleteDebt(userId: string, debtId: string): Promise<void> {
    const debtRef = this.getUserDoc(userId, 'debts', debtId);
    await deleteDoc(debtRef);
  }

  // Debt Participants Management
  async saveDebtParticipants(userId: string, participants: DebtParticipant[]): Promise<void> {
    const batch = writeBatch(db);
    const participantsRef = this.getUserCollection(userId, 'debtParticipants');
    
    // Clear existing participants first
    const existingParticipants = await getDocs(participantsRef);
    existingParticipants.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new participants
    participants.forEach((participant) => {
      const participantRef = doc(participantsRef, participant.id);
      batch.set(participantRef, {
        ...participant,
        updatedAt: new Date()
      });
    });

    await batch.commit();
  }

  async getDebtParticipants(userId: string): Promise<DebtParticipant[]> {
    try {
      const participantsRef = this.getUserCollection(userId, 'debtParticipants');
      const snapshot = await getDocs(participantsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DebtParticipant[];
    } catch (error) {
      console.error('Error getting debt participants:', error);
      return [];
    }
  }

  async saveDebtParticipant(userId: string, participant: DebtParticipant): Promise<void> {
    const participantRef = this.getUserDoc(userId, 'debtParticipants', participant.id);
    await setDoc(participantRef, {
      ...participant,
      updatedAt: new Date()
    });
  }

  // Debt Payments Management
  async saveDebtPayments(userId: string, payments: DebtPayment[]): Promise<void> {
    const batch = writeBatch(db);
    const paymentsRef = this.getUserCollection(userId, 'debtPayments');
    
    // Clear existing payments first
    const existingPayments = await getDocs(paymentsRef);
    existingPayments.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new payments
    payments.forEach((payment) => {
      const paymentRef = doc(paymentsRef, payment.id);
      batch.set(paymentRef, {
        ...payment,
        date: payment.date.toISOString(),
        updatedAt: new Date()
      });
    });

    await batch.commit();
  }

  async getDebtPayments(userId: string): Promise<DebtPayment[]> {
    try {
      const paymentsRef = this.getUserCollection(userId, 'debtPayments');
      const snapshot = await getDocs(query(paymentsRef, orderBy('date', 'desc')));
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: new Date(data.date)
        };
      }) as DebtPayment[];
    } catch (error) {
      console.error('Error getting debt payments:', error);
      return [];
    }
  }

  async saveDebtPayment(userId: string, payment: DebtPayment): Promise<void> {
    const paymentRef = this.getUserDoc(userId, 'debtPayments', payment.id);
    await setDoc(paymentRef, {
      ...payment,
      date: payment.date.toISOString(),
      updatedAt: new Date()
    });
  }

  // Alert Settings Management
  async saveAlertSettings(userId: string, settings: AlertSettings): Promise<void> {
    const settingsRef = this.getUserDoc(userId, 'settings', 'alertSettings');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date()
    });
  }

  async getAlertSettings(userId: string): Promise<AlertSettings> {
    try {
      const settingsRef = this.getUserDoc(userId, 'settings', 'alertSettings');
      const doc = await getDoc(settingsRef);
      
      if (doc.exists()) {
        return doc.data() as AlertSettings;
      }
      
      // Return default settings if none exist
      return {
        budgetWarningThreshold: 80,
        enableSystemNotifications: true,
        weeklyReports: false,
      };
    } catch (error) {
      console.error('Error getting alert settings:', error);
      return {
        budgetWarningThreshold: 80,
        enableSystemNotifications: true,
        weeklyReports: false,
      };
    }
  }

  // Data Export/Import
  async exportUserData(userId: string): Promise<string> {
    try {
      const [budgets, expenses, debts, participants, payments, settings] = await Promise.all([
        this.getBudgets(userId),
        this.getExpenses(userId),
        this.getDebts(userId),
        this.getDebtParticipants(userId),
        this.getDebtPayments(userId),
        this.getAlertSettings(userId)
      ]);

      const data = {
        budgets,
        expenses,
        debts,
        debtParticipants: participants,
        debtPayments: payments,
        alertSettings: settings,
        exportDate: new Date().toISOString(),
        userId
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  async importUserData(userId: string, jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate that the data belongs to the current user or is a valid export
      if (data.userId && data.userId !== userId) {
        console.warn('Importing data from different user');
      }

      // Import data in parallel
      const promises = [];
      
      if (data.budgets) {
        promises.push(this.saveBudgets(userId, data.budgets));
      }
      
      if (data.expenses) {
        // Convert date strings back to Date objects
        const expenses = data.expenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        }));
        promises.push(this.saveExpenses(userId, expenses));
      }
      
      if (data.debts) {
        // Convert date strings back to Date objects
        const debts = data.debts.map((debt: any) => ({
          ...debt,
          date: new Date(debt.date),
          dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
          payments: debt.payments?.map((payment: any) => ({
            ...payment,
            date: new Date(payment.date)
          })) || [],
          splits: debt.splits?.map((split: any) => ({
            ...split,
            paidDate: split.paidDate ? new Date(split.paidDate) : undefined
          })) || []
        }));
        promises.push(this.saveDebts(userId, debts));
      }
      
      if (data.debtParticipants) {
        promises.push(this.saveDebtParticipants(userId, data.debtParticipants));
      }
      
      if (data.debtPayments) {
        // Convert date strings back to Date objects
        const payments = data.debtPayments.map((payment: any) => ({
          ...payment,
          date: new Date(payment.date)
        }));
        promises.push(this.saveDebtPayments(userId, payments));
      }
      
      if (data.alertSettings) {
        promises.push(this.saveAlertSettings(userId, data.alertSettings));
      }

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }

  // User Profile Management
  async saveUserProfile(userId: string, profile: any): Promise<void> {
    const profileRef = this.getUserDoc(userId, 'profile', 'main');
    await setDoc(profileRef, {
      ...profile,
      updatedAt: new Date()
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const profileRef = this.getUserDoc(userId, 'profile', 'main');
      const doc = await getDoc(profileRef);
      
      if (doc.exists()) {
        return doc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}

export const userDataService = new UserDataService();