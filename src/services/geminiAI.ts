import { GoogleGenerativeAI } from '@google/generative-ai';
import { Budget, Expense, Debt } from '../types';
import { formatCurrency } from '../utils/currency';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!API_KEY) {
      console.error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async getFinancialAdvice(
    question: string,
    context: {
      budgets: Budget[];
      expenses: Expense[];
      debts: Debt[];
    }
  ): Promise<string> {
    if (!this.model) {
      return 'Xin lỗi, dịch vụ AI hiện không khả dụng. Vui lòng kiểm tra cấu hình API key.';
    }

    try {
      const currentBudget = context.budgets.find(budget => {
        const now = new Date();
        return budget.year === now.getFullYear() && 
               budget.month === now.toISOString().slice(0, 7);
      });

      const currentMonthExpenses = context.expenses.filter(expense => {
        const now = new Date();
        return expense.date.getMonth() === now.getMonth() && 
               expense.date.getFullYear() === now.getFullYear();
      });

      const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalBudget = currentBudget?.totalAllocated || 0;
      const monthlyIncome = currentBudget?.monthlyIncome || 0;

      const totalDebt = context.debts.reduce((sum, debt) => {
        if (debt.type === 'borrow' || debt.type === 'group_payment') {
          return sum + (debt.totalAmount - (debt.paidAmount || 0));
        }
        return sum;
      }, 0);

      const totalLending = context.debts.reduce((sum, debt) => {
        if (debt.type === 'lend' || debt.type === 'group_receive') {
          return sum + (debt.totalAmount - (debt.paidAmount || 0));
        }
        return sum;
      }, 0);

      const contextPrompt = `
Bạn là một chuyên gia tài chính cá nhân AI thông minh, chuyên nghiệp và thân thiện. Bạn có khả năng phân tích dữ liệu tài chính và đưa ra lời khuyên cụ thể, thiết thực.

THÔNG TIN TÀI CHÍNH HIỆN TẠI:
- Thu nhập tháng: ${formatCurrency(monthlyIncome)}
- Tổng ngân sách: ${formatCurrency(totalBudget)}
- Đã chi tiêu tháng này: ${formatCurrency(totalSpent)}
- Tỷ lệ sử dụng ngân sách: ${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
- Tổng nợ phải trả: ${formatCurrency(totalDebt)}
- Tổng tiền cho mượn: ${formatCurrency(totalLending)}
- Vị thế tài chính ròng: ${formatCurrency(totalLending - totalDebt)}
- Số giao dịch tháng này: ${currentMonthExpenses.length}

DANH MỤC CHI TIÊU CHI TIẾT:
${currentBudget?.categories.map(cat => {
  const usagePercent = cat.allocatedAmount > 0 ? ((cat.spentAmount / cat.allocatedAmount) * 100).toFixed(1) : 0;
  const status = parseFloat(usagePercent) >= 100 ? '⚠️ VƯỢT NGÂN SÁCH' : 
                 parseFloat(usagePercent) >= 80 ? '⚡ GẦN HẾT' : '✅ AN TOÀN';
  return `- ${cat.icon} ${cat.name}: ${formatCurrency(cat.spentAmount)}/${formatCurrency(cat.allocatedAmount)} (${usagePercent}%) ${status}`;
}).join('\n') || 'Chưa có danh mục nào được thiết lập'}

CHI TIÊU GẦN ĐÂY (5 giao dịch mới nhất):
${currentMonthExpenses
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5)
  .map(expense => {
    const category = currentBudget?.categories.find(cat => cat.id === expense.categoryId);
    return `- ${expense.description}: ${formatCurrency(expense.amount)} (${category?.icon} ${category?.name || 'Khác'}) - ${expense.date.toLocaleDateString('vi-VN')}`;
  }).join('\n') || 'Chưa có chi tiêu nào trong tháng này'}

KHOẢN VAY NỢ ĐANG HOẠT ĐỘNG:
${context.debts
  .filter(debt => debt.status !== 'completed')
  .slice(0, 5)
  .map(debt => {
    const remaining = debt.totalAmount - (debt.paidAmount || 0);
    const typeLabel = debt.type === 'lend' || debt.type === 'group_receive' ? '💰 Cho mượn' : '🏦 Mượn';
    const urgency = debt.dueDate && new Date(debt.dueDate) < new Date() ? '🚨 QUÁ HẠN' : '';
    return `- ${debt.title}: ${formatCurrency(remaining)} (${typeLabel}) ${urgency}`;
  }).join('\n') || 'Không có khoản vay nợ nào đang hoạt động'}

PHÂN TÍCH TÌNH HÌNH TÀI CHÍNH:
- Tỷ lệ tiết kiệm: ${monthlyIncome > 0 ? (((monthlyIncome - totalSpent) / monthlyIncome) * 100).toFixed(1) : 0}%
- Khả năng thanh toán nợ: ${totalDebt > 0 && monthlyIncome > 0 ? ((monthlyIncome - totalSpent) / totalDebt * 100).toFixed(1) : 'N/A'}%
- Mức độ rủi ro tài chính: ${totalSpent > monthlyIncome ? 'CAO - Chi tiêu vượt thu nhập' : 
                            totalSpent > monthlyIncome * 0.8 ? 'TRUNG BÌNH - Chi tiêu cao' : 
                            'THẤP - Tài chính ổn định'}

HƯỚNG DẪN TRẢ LỜI:
1. Sử dụng tiếng Việt tự nhiên, chuyên nghiệp nhưng thân thiện
2. Phân tích dữ liệu cụ thể và đưa ra nhận xét chính xác
3. Đưa ra lời khuyên thiết thực, có thể thực hiện được
4. Ưu tiên các giải pháp ngắn hạn và dài hạn
5. Sử dụng emoji phù hợp để làm rõ ý nghĩa
6. Cảnh báo rủi ro và đưa ra biện pháp phòng ngừa
7. Khuyến khích thói quen tài chính tích cực
8. Đưa ra các bước hành động cụ thể, có thể đo lường được

CÂU HỎI CỦA NGƯỜI DÙNG: "${question}"

Hãy phân tích và trả lời một cách chi tiết, chuyên nghiệp:
`;

      const result = await this.model.generateContent(contextPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting AI advice:', error);
      return 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.';
    }
  }

  async analyzeBudget(budget: Budget, expenses: Expense[]): Promise<string> {
    if (!this.model) {
      return 'Dịch vụ phân tích AI hiện không khả dụng.';
    }

    try {
      const currentMonthExpenses = expenses.filter(expense => {
        const now = new Date();
        return expense.date.getMonth() === now.getMonth() && 
               expense.date.getFullYear() === now.getFullYear();
      });

      const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const budgetUsage = budget.totalAllocated > 0 ? (totalSpent / budget.totalAllocated) * 100 : 0;
      const savingsRate = budget.monthlyIncome > 0 ? ((budget.monthlyIncome - totalSpent) / budget.monthlyIncome) * 100 : 0;

      const overBudgetCategories = budget.categories.filter(cat => 
        cat.spentAmount > cat.allocatedAmount
      );

      const underutilizedCategories = budget.categories.filter(cat => 
        cat.allocatedAmount > 0 && (cat.spentAmount / cat.allocatedAmount) < 0.5
      );

      const prompt = `
Bạn là chuyên gia phân tích ngân sách. Hãy phân tích chi tiết ngân sách tháng này và đưa ra lời khuyên cụ thể:

📊 TỔNG QUAN NGÂN SÁCH:
- Thu nhập tháng: ${formatCurrency(budget.monthlyIncome)}
- Tổng ngân sách phân bổ: ${formatCurrency(budget.totalAllocated)}
- Đã chi tiêu: ${formatCurrency(totalSpent)}
- Tỷ lệ sử dụng ngân sách: ${budgetUsage.toFixed(1)}%
- Tỷ lệ tiết kiệm: ${savingsRate.toFixed(1)}%
- Số dư còn lại: ${formatCurrency(budget.monthlyIncome - totalSpent)}

⚠️ DANH MỤC VƯỢT NGÂN SÁCH (${overBudgetCategories.length} danh mục):
${overBudgetCategories.map(cat => 
  `- ${cat.icon} ${cat.name}: Vượt ${formatCurrency(cat.spentAmount - cat.allocatedAmount)} (${((cat.spentAmount / cat.allocatedAmount - 1) * 100).toFixed(1)}%)`
).join('\n') || 'Không có danh mục nào vượt ngân sách 🎉'}

💡 DANH MỤC SỬ DỤNG THẤP (${underutilizedCategories.length} danh mục):
${underutilizedCategories.map(cat => 
  `- ${cat.icon} ${cat.name}: Chỉ sử dụng ${((cat.spentAmount / cat.allocatedAmount) * 100).toFixed(1)}% (${formatCurrency(cat.allocatedAmount - cat.spentAmount)} còn lại)`
).join('\n') || 'Tất cả danh mục đều được sử dụng hiệu quả'}

📈 CHI TIẾT TỪNG DANH MỤC:
${budget.categories.map(cat => {
  const usage = cat.allocatedAmount > 0 ? (cat.spentAmount / cat.allocatedAmount) * 100 : 0;
  const status = usage >= 100 ? '🔴' : usage >= 80 ? '🟡' : usage >= 50 ? '🟢' : '⚪';
  return `${status} ${cat.icon} ${cat.name}: ${formatCurrency(cat.spentAmount)}/${formatCurrency(cat.allocatedAmount)} (${usage.toFixed(1)}%)`;
}).join('\n')}

Hãy đưa ra:
1. Đánh giá tổng thể về tình hình ngân sách
2. Phân tích các điểm mạnh và điểm yếu
3. Lời khuyên cụ thể để cải thiện từng danh mục
4. Chiến lược tối ưu hóa ngân sách cho tháng tới
5. Cảnh báo rủi ro và biện pháp phòng ngừa
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing budget:', error);
      return 'Không thể phân tích ngân sách lúc này. Vui lòng thử lại sau.';
    }
  }

  async getSpendingInsights(expenses: Expense[]): Promise<string> {
    if (!this.model) {
      return 'Dịch vụ phân tích chi tiêu hiện không khả dụng.';
    }

    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthExpenses = expenses.filter(expense => 
        expense.date.getMonth() === currentMonth && expense.date.getFullYear() === currentYear
      );

      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const lastMonthExpenses = expenses.filter(expense => 
        expense.date.getMonth() === lastMonth && expense.date.getFullYear() === lastMonthYear
      );

      const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const change = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
      const avgDaily = thisMonthTotal / new Date().getDate();

      // Phân tích theo ngày trong tuần
      const weekdaySpending = thisMonthExpenses.reduce((acc, expense) => {
        const day = expense.date.getDay();
        acc[day] = (acc[day] || 0) + expense.amount;
        return acc;
      }, {} as Record<number, number>);

      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const spendingByDay = Object.entries(weekdaySpending)
        .map(([day, amount]) => `${dayNames[parseInt(day)]}: ${formatCurrency(amount)}`)
        .join('\n');

      const prompt = `
Phân tích xu hướng và thói quen chi tiêu chi tiết:

📊 SO SÁNH THÁNG HIỆN TẠI VS THÁNG TRƯỚC:
- Tháng này: ${formatCurrency(thisMonthTotal)} (${thisMonthExpenses.length} giao dịch)
- Tháng trước: ${formatCurrency(lastMonthTotal)} (${lastMonthExpenses.length} giao dịch)
- Thay đổi: ${change >= 0 ? '+' : ''}${change.toFixed(1)}% ${change > 0 ? '📈' : change < 0 ? '📉' : '➡️'}
- Trung bình/ngày: ${formatCurrency(avgDaily)}

💰 TOP 5 CHI TIÊU LỚN NHẤT THÁNG NÀY:
${thisMonthExpenses
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)
  .map((expense, index) => `${index + 1}. ${expense.description}: ${formatCurrency(expense.amount)} (${expense.date.toLocaleDateString('vi-VN')})`)
  .join('\n')}

📅 PHÂN TÍCH THEO NGÀY TRONG TUẦN:
${spendingByDay || 'Chưa có dữ liệu đủ để phân tích'}

🔄 CHI TIÊU ĐỊNH KỲ:
${thisMonthExpenses
  .filter(expense => expense.isRecurring)
  .map(expense => `- ${expense.description}: ${formatCurrency(expense.amount)} (${expense.recurringType})`)
  .join('\n') || 'Không có chi tiêu định kỳ nào'}

📈 XU HƯỚNG CHI TIÊU:
- Tần suất giao dịch: ${(thisMonthExpenses.length / new Date().getDate()).toFixed(1)} giao dịch/ngày
- Giá trị trung bình/giao dịch: ${thisMonthExpenses.length > 0 ? formatCurrency(thisMonthTotal / thisMonthExpenses.length) : '0 ₫'}

Hãy đưa ra:
1. Phân tích xu hướng chi tiêu và thói quen
2. Nhận xét về sự thay đổi so với tháng trước
3. Đánh giá các khoản chi tiêu lớn và tính hợp lý
4. Lời khuyên tối ưu hóa chi tiêu
5. Chiến lược kiểm soát chi tiêu hiệu quả
6. Dự báo xu hướng cho tháng tới
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting spending insights:', error);
      return 'Không thể phân tích chi tiêu lúc này. Vui lòng thử lại sau.';
    }
  }

  async getDebtAdvice(debts: Debt[]): Promise<string> {
    if (!this.model) {
      return 'Dịch vụ tư vấn vay nợ hiện không khả dụng.';
    }

    try {
      const totalOwed = debts.reduce((sum, debt) => {
        if (debt.type === 'borrow' || debt.type === 'group_payment') {
          return sum + (debt.totalAmount - (debt.paidAmount || 0));
        }
        return sum;
      }, 0);

      const totalLent = debts.reduce((sum, debt) => {
        if (debt.type === 'lend' || debt.type === 'group_receive') {
          return sum + (debt.totalAmount - (debt.paidAmount || 0));
        }
        return sum;
      }, 0);

      const overdueDebts = debts.filter(debt => {
        if (!debt.dueDate || debt.status === 'completed') return false;
        return new Date(debt.dueDate) < new Date();
      });

      const activeDebts = debts.filter(debt => debt.status !== 'completed');
      const completedDebts = debts.filter(debt => debt.status === 'completed');

      const prompt = `
Phân tích tình hình vay nợ và đưa ra tư vấn chuyên sâu:

💰 TỔNG QUAN VỊ THẾ TÀI CHÍNH:
- Tổng nợ phải trả: ${formatCurrency(totalOwed)}
- Tổng tiền cho mượn: ${formatCurrency(totalLent)}
- Vị thế ròng: ${formatCurrency(totalLent - totalOwed)} ${totalLent >= totalOwed ? '✅ Tích cực' : '⚠️ Tiêu cực'}
- Tổng số khoản đang hoạt động: ${activeDebts.length}
- Tổng số khoản đã hoàn thành: ${completedDebts.length}

🚨 KHOẢN NỢ QUÁ HẠN (${overdueDebts.length} khoản):
${overdueDebts.map(debt => {
  const remaining = debt.totalAmount - (debt.paidAmount || 0);
  const overdueDays = Math.floor((new Date().getTime() - new Date(debt.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
  return `- ${debt.title}: ${formatCurrency(remaining)} (Quá hạn ${overdueDays} ngày)`;
}).join('\n') || 'Không có khoản nào quá hạn 🎉'}

📋 CHI TIẾT CÁC KHOẢN ĐANG HOẠT ĐỘNG:
${activeDebts.map(debt => {
  const remaining = debt.totalAmount - (debt.paidAmount || 0);
  const typeIcon = debt.type === 'lend' || debt.type === 'group_receive' ? '💰' : '🏦';
  const typeLabel = debt.type === 'lend' || debt.type === 'group_receive' ? 'Cho mượn' : 'Mượn';
  const progress = debt.paidAmount ? ((debt.paidAmount / debt.totalAmount) * 100).toFixed(1) : '0';
  const dueInfo = debt.dueDate ? ` (Đến hạn: ${new Date(debt.dueDate).toLocaleDateString('vi-VN')})` : '';
  return `${typeIcon} ${debt.title}: ${formatCurrency(remaining)} còn lại (${typeLabel}, ${progress}% đã trả)${dueInfo}`;
}).join('\n') || 'Không có khoản vay nợ nào đang hoạt động'}

📊 PHÂN TÍCH HIỆU SUẤT:
- Tỷ lệ hoàn thành: ${debts.length > 0 ? ((completedDebts.length / debts.length) * 100).toFixed(1) : 0}%
- Số khoản cho mượn: ${debts.filter(d => d.type === 'lend' || d.type === 'group_receive').length}
- Số khoản mượn: ${debts.filter(d => d.type === 'borrow' || d.type === 'group_payment').length}

🎯 ƯU TIÊN THANH TOÁN (Theo mức độ khẩn cấp):
${activeDebts
  .filter(debt => debt.type === 'borrow' || debt.type === 'group_payment')
  .sort((a, b) => {
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.totalAmount - a.totalAmount;
  })
  .slice(0, 5)
  .map((debt, index) => {
    const remaining = debt.totalAmount - (debt.paidAmount || 0);
    const urgency = debt.dueDate && new Date(debt.dueDate) < new Date() ? '🚨 QUÁ HẠN' : 
                   debt.dueDate && new Date(debt.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? '⚡ KHẨN CẤP' : '📅 BÌNH THƯỜNG';
    return `${index + 1}. ${debt.title}: ${formatCurrency(remaining)} ${urgency}`;
  }).join('\n') || 'Không có khoản nợ nào cần ưu tiên'}

Hãy đưa ra:
1. Đánh giá tổng thể về tình hình vay nợ
2. Phân tích rủi ro và cơ hội
3. Chiến lược ưu tiên thanh toán nợ
4. Lời khuyên quản lý dòng tiền
5. Biện pháp phòng ngừa rủi ro
6. Kế hoạch cải thiện vị thế tài chính
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting debt advice:', error);
      return 'Không thể phân tích vay nợ lúc này. Vui lòng thử lại sau.';
    }
  }

  async getPersonalizedTips(context: { budgets: Budget[]; expenses: Expense[]; debts: Debt[] }): Promise<string> {
    if (!this.model) {
      return 'Dịch vụ tư vấn cá nhân hóa hiện không khả dụng.';
    }

    try {
      const prompt = `
Dựa trên dữ liệu tài chính cá nhân, hãy đưa ra 7 lời khuyên tài chính cá nhân hóa, thiết thực và có thể thực hiện ngay:

Yêu cầu:
1. Mỗi lời khuyên phải cụ thể, có thể đo lường được
2. Ưu tiên các hành động có tác động ngay lập tức
3. Bao gồm cả lời khuyên ngắn hạn và dài hạn
4. Đưa ra số liệu cụ thể khi có thể
5. Sử dụng emoji để làm nổi bật
6. Giải thích lý do tại sao nên làm theo lời khuyên đó
7. Đưa ra bước hành động cụ thể

Hãy tập trung vào:
- Tối ưu hóa ngân sách hiện tại
- Cải thiện thói quen chi tiêu
- Tăng khả năng tiết kiệm
- Quản lý nợ hiệu quả
- Xây dựng quỹ dự phòng
- Lập kế hoạch tài chính dài hạn
- Tận dụng cơ hội đầu tư nhỏ
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting personalized tips:', error);
      return 'Không thể tạo lời khuyên cá nhân hóa lúc này.';
    }
  }
}

export const geminiAI = new GeminiAIService();