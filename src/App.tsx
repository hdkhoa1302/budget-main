import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { BudgetView } from './components/Budget/BudgetView';
import { ExpenseView } from './components/Expenses/ExpenseView';
import { DebtView } from './components/Debts/DebtView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { ReportsView } from './components/Reports/ReportsView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { AIAssistant } from './components/AI/AIAssistant';
import { Budget, Expense, AlertSettings, Debt, DebtParticipant, DebtPayment } from './types';
import { storageUtils } from './utils/storage';
import { notificationUtils } from './utils/notifications';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtParticipants, setDebtParticipants] = useState<DebtParticipant[]>([]);
  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    budgetWarningThreshold: 80,
    enableSystemNotifications: true,
    weeklyReports: false,
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          loadedBudgets,
          loadedExpenses,
          loadedDebts,
          loadedParticipants,
          loadedPayments,
          loadedSettings
        ] = await Promise.all([
          storageUtils.getBudgets(),
          storageUtils.getExpenses(),
          storageUtils.getDebts(),
          storageUtils.getDebtParticipants(),
          storageUtils.getDebtPayments(),
          storageUtils.getAlertSettings()
        ]);

        setBudgets(loadedBudgets);
        setExpenses(loadedExpenses);
        setDebts(loadedDebts);
        setDebtParticipants(loadedParticipants);
        setDebtPayments(loadedPayments);
        setAlertSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Get current budget
  const currentBudget = budgets.find(budget => {
    const now = new Date();
    return budget.year === now.getFullYear() && 
           budget.month === now.toISOString().slice(0, 7);
  }) || budgets[budgets.length - 1] || null;

  // Update budget
  const handleBudgetUpdate = async (updatedBudget: Budget) => {
    const updatedBudgets = budgets.some(b => b.id === updatedBudget.id)
      ? budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b)
      : [...budgets, updatedBudget];
    
    setBudgets(updatedBudgets);
    await storageUtils.saveBudgets(updatedBudgets);
  };

  // Delete budget
  const handleBudgetDelete = async (budgetId: string) => {
    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    setBudgets(updatedBudgets);
    await storageUtils.saveBudgets(updatedBudgets);
  };

  // Add expense and update budget
  const handleExpenseAdd = async (newExpense: Expense) => {
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await storageUtils.saveExpenses(updatedExpenses);

    // Update budget category spent amount
    const expenseMonth = newExpense.date.toISOString().slice(0, 7);
    const expenseYear = newExpense.date.getFullYear();
    
    const targetBudget = budgets.find(budget => 
      budget.month === expenseMonth && budget.year === expenseYear
    );

    if (targetBudget) {
      const updatedCategories = targetBudget.categories.map(cat =>
        cat.id === newExpense.categoryId
          ? { ...cat, spentAmount: cat.spentAmount + newExpense.amount }
          : cat
      );

      const updatedBudget = {
        ...targetBudget,
        categories: updatedCategories,
        totalSpent: updatedCategories.reduce((sum, cat) => sum + cat.spentAmount, 0),
      };

      handleBudgetUpdate(updatedBudget);

      // Check for budget alerts
      if (alertSettings.enableSystemNotifications) {
        notificationUtils.checkBudgetAlerts(updatedCategories, alertSettings.budgetWarningThreshold);
      }
    }
  };

  // Update expense
  const handleExpenseUpdate = async (updatedExpense: Expense) => {
    const oldExpense = expenses.find(e => e.id === updatedExpense.id);
    if (!oldExpense) return;

    const updatedExpenses = expenses.map(e => 
      e.id === updatedExpense.id ? updatedExpense : e
    );
    setExpenses(updatedExpenses);
    await storageUtils.saveExpenses(updatedExpenses);

    // Update budgets for both old and new months if different
    const oldMonth = oldExpense.date.toISOString().slice(0, 7);
    const oldYear = oldExpense.date.getFullYear();
    const newMonth = updatedExpense.date.toISOString().slice(0, 7);
    const newYear = updatedExpense.date.getFullYear();

    // Update old budget
    const oldBudget = budgets.find(budget => 
      budget.month === oldMonth && budget.year === oldYear
    );
    
    if (oldBudget) {
      const updatedCategories = oldBudget.categories.map(cat =>
        cat.id === oldExpense.categoryId
          ? { ...cat, spentAmount: cat.spentAmount - oldExpense.amount }
          : cat
      );

      const updatedBudget = {
        ...oldBudget,
        categories: updatedCategories,
        totalSpent: updatedCategories.reduce((sum, cat) => sum + cat.spentAmount, 0),
      };

      handleBudgetUpdate(updatedBudget);
    }

    // Update new budget if different month
    if (oldMonth !== newMonth || oldYear !== newYear) {
      const newBudget = budgets.find(budget => 
        budget.month === newMonth && budget.year === newYear
      );
      
      if (newBudget) {
        const updatedCategories = newBudget.categories.map(cat =>
          cat.id === updatedExpense.categoryId
            ? { ...cat, spentAmount: cat.spentAmount + updatedExpense.amount }
            : cat
        );

        const updatedBudget = {
          ...newBudget,
          categories: updatedCategories,
          totalSpent: updatedCategories.reduce((sum, cat) => sum + cat.spentAmount, 0),
        };

        handleBudgetUpdate(updatedBudget);
      }
    }
  };

  // Delete expense
  const handleExpenseDelete = async (expenseId: string) => {
    const expenseToDelete = expenses.find(e => e.id === expenseId);
    if (!expenseToDelete) return;

    const updatedExpenses = expenses.filter(e => e.id !== expenseId);
    setExpenses(updatedExpenses);
    await storageUtils.saveExpenses(updatedExpenses);

    // Update budget
    const expenseMonth = expenseToDelete.date.toISOString().slice(0, 7);
    const expenseYear = expenseToDelete.date.getFullYear();
    
    const targetBudget = budgets.find(budget => 
      budget.month === expenseMonth && budget.year === expenseYear
    );

    if (targetBudget) {
      const updatedCategories = targetBudget.categories.map(cat =>
        cat.id === expenseToDelete.categoryId
          ? { ...cat, spentAmount: cat.spentAmount - expenseToDelete.amount }
          : cat
      );

      const updatedBudget = {
        ...targetBudget,
        categories: updatedCategories,
        totalSpent: updatedCategories.reduce((sum, cat) => sum + cat.spentAmount, 0),
      };

      handleBudgetUpdate(updatedBudget);
    }
  };

  // Debt Management Functions
  const handleDebtAdd = async (newDebt: Debt) => {
    const updatedDebts = [...debts, newDebt];
    setDebts(updatedDebts);
    await storageUtils.saveDebts(updatedDebts);
  };

  const handleDebtUpdate = async (updatedDebt: Debt) => {
    const updatedDebts = debts.map(d => 
      d.id === updatedDebt.id ? updatedDebt : d
    );
    setDebts(updatedDebts);
    await storageUtils.saveDebts(updatedDebts);
  };

  const handleDebtDelete = async (debtId: string) => {
    const updatedDebts = debts.filter(d => d.id !== debtId);
    setDebts(updatedDebts);
    await storageUtils.saveDebts(updatedDebts);

    // Also remove related payments
    const updatedPayments = debtPayments.filter(p => p.debtId !== debtId);
    setDebtPayments(updatedPayments);
    await storageUtils.saveDebtPayments(updatedPayments);
  };

  const handleParticipantAdd = async (newParticipant: DebtParticipant) => {
    const updatedParticipants = [...debtParticipants, newParticipant];
    setDebtParticipants(updatedParticipants);
    await storageUtils.saveDebtParticipants(updatedParticipants);
  };

  const handlePaymentAdd = async (newPayment: DebtPayment) => {
    const updatedPayments = [...debtPayments, newPayment];
    setDebtPayments(updatedPayments);
    await storageUtils.saveDebtPayments(updatedPayments);

    // Update debt status and paid amount
    const debt = debts.find(d => d.id === newPayment.debtId);
    if (debt) {
      const existingPayments = debt.payments || [];
      const allPayments = [...existingPayments, newPayment];
      const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      let newStatus = debt.status;
      if (totalPaid >= debt.totalAmount) {
        newStatus = 'completed';
      } else if (totalPaid > 0) {
        newStatus = 'partially_paid';
      }

      // Update splits for group payments
      let updatedSplits = debt.splits;
      if (debt.splits && newPayment.participantId) {
        updatedSplits = debt.splits.map(split => {
          if (split.participantId === newPayment.participantId) {
            const participantPayments = allPayments.filter(p => p.participantId === split.participantId);
            const participantPaid = participantPayments.reduce((sum, p) => sum + p.amount, 0);
            return {
              ...split,
              isPaid: participantPaid >= split.amount,
              paidDate: participantPaid >= split.amount ? newPayment.date : split.paidDate,
            };
          }
          return split;
        });
      }

      const updatedDebt: Debt = {
        ...debt,
        paidAmount: totalPaid,
        status: newStatus,
        payments: allPayments,
        splits: updatedSplits,
      };

      handleDebtUpdate(updatedDebt);
    }
  };

  // Export data
  const handleExport = async () => {
    try {
      const dataStr = await storageUtils.exportData();
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu');
    }
  };

  // Import data
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          try {
            const success = await storageUtils.importData(content);
            if (success) {
              // Reload data
              const [
                loadedBudgets,
                loadedExpenses,
                loadedDebts,
                loadedParticipants,
                loadedPayments,
                loadedSettings
              ] = await Promise.all([
                storageUtils.getBudgets(),
                storageUtils.getExpenses(),
                storageUtils.getDebts(),
                storageUtils.getDebtParticipants(),
                storageUtils.getDebtPayments(),
                storageUtils.getAlertSettings()
              ]);

              setBudgets(loadedBudgets);
              setExpenses(loadedExpenses);
              setDebts(loadedDebts);
              setDebtParticipants(loadedParticipants);
              setDebtPayments(loadedPayments);
              setAlertSettings(loadedSettings);
              
              alert('Dữ liệu đã được nhập thành công!');
            } else {
              alert('Lỗi khi nhập dữ liệu. Vui lòng kiểm tra file.');
            }
          } catch (error) {
            console.error('Error importing data:', error);
            alert('Lỗi khi nhập dữ liệu. Vui lòng kiểm tra file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Update settings
  const handleSettingsUpdate = async (newSettings: AlertSettings) => {
    setAlertSettings(newSettings);
    await storageUtils.saveAlertSettings(newSettings);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView currentBudget={currentBudget} expenses={expenses} />;
      case 'budget':
        return (
          <BudgetView 
            budgets={budgets}
            currentBudget={currentBudget} 
            onBudgetUpdate={handleBudgetUpdate}
            onBudgetDelete={handleBudgetDelete}
          />
        );
      case 'expenses':
        return (
          <ExpenseView
            expenses={expenses}
            categories={currentBudget?.categories || []}
            onExpenseAdd={handleExpenseAdd}
            onExpenseUpdate={handleExpenseUpdate}
            onExpenseDelete={handleExpenseDelete}
          />
        );
      case 'debts':
        return (
          <DebtView
            debts={debts}
            participants={debtParticipants}
            payments={debtPayments}
            onDebtAdd={handleDebtAdd}
            onDebtUpdate={handleDebtUpdate}
            onDebtDelete={handleDebtDelete}
            onParticipantAdd={handleParticipantAdd}
            onPaymentAdd={handlePaymentAdd}
          />
        );
      case 'analytics':
        return <AnalyticsView expenses={expenses} categories={currentBudget?.categories || []} />;
      case 'reports':
        return (
          <ReportsView
            expenses={expenses}
            categories={currentBudget?.categories || []}
            currentBudget={currentBudget}
          />
        );
      default:
        return <DashboardView currentBudget={currentBudget} expenses={expenses} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onSettingsClick={() => setSettingsOpen(true)}
        onExportClick={handleExport}
        onImportClick={handleImport}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="flex-1 p-6 lg:ml-0">
          {renderContent()}
        </main>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        alertSettings={alertSettings}
        onUpdateSettings={handleSettingsUpdate}
      />

      <AIAssistant
        budgets={budgets}
        expenses={expenses}
        debts={debts}
      />
    </div>
  );
}

export default App;