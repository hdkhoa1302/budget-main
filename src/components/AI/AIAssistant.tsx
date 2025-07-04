import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Loader, X, TrendingUp, PieChart, CreditCard, Lightbulb, Brain, Target, Zap, Minimize2, Maximize2 } from 'lucide-react';
import { geminiAI } from '../../services/geminiAI';
import { Budget, Expense, Debt } from '../../types';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface AIAssistantProps {
  budgets: Budget[];
  expenses: Expense[];
  debts: Debt[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  budgets,
  expenses,
  debts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Xin chào! Tôi là AI Assistant chuyên về tài chính cá nhân của bạn.\n\n🎯 Tôi có thể giúp bạn:\n• Phân tích ngân sách và chi tiêu\n• Đưa ra lời khuyên tối ưu hóa tài chính\n• Tư vấn quản lý vay nợ\n• Lập kế hoạch tiết kiệm\n• Dự báo xu hướng chi tiêu\n\n💡 Hãy thử các hành động nhanh bên dưới hoặc đặt câu hỏi cụ thể về tình hình tài chính của bạn!',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'ai', isLoading = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isLoading,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, content: string, isLoading = false) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content, isLoading } : msg
    ));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    addMessage(userMessage, 'user');
    
    const loadingId = addMessage('🤔 Đang phân tích dữ liệu tài chính của bạn...', 'ai', true);
    setIsLoading(true);

    try {
      const response = await geminiAI.getFinancialAdvice(userMessage, {
        budgets,
        expenses,
        debts,
      });

      updateMessage(loadingId, response);
    } catch (error) {
      updateMessage(loadingId, '❌ Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (isLoading) return;

    let actionText = '';
    let loadingText = '';
    
    switch (action) {
      case 'budget-analysis':
        actionText = 'Phân tích ngân sách tháng này';
        loadingText = '📊 Đang phân tích ngân sách chi tiết...';
        break;
      case 'spending-insights':
        actionText = 'Phân tích xu hướng chi tiêu';
        loadingText = '📈 Đang phân tích thói quen chi tiêu...';
        break;
      case 'debt-advice':
        actionText = 'Tư vấn quản lý vay nợ';
        loadingText = '💳 Đang phân tích tình hình vay nợ...';
        break;
      case 'financial-tips':
        actionText = 'Lời khuyên tài chính cá nhân hóa';
        loadingText = '💡 Đang tạo lời khuyên phù hợp với bạn...';
        break;
      case 'savings-plan':
        actionText = 'Lập kế hoạch tiết kiệm';
        loadingText = '🎯 Đang tạo kế hoạch tiết kiệm tối ưu...';
        break;
      case 'risk-assessment':
        actionText = 'Đánh giá rủi ro tài chính';
        loadingText = '⚠️ Đang đánh giá mức độ rủi ro...';
        break;
    }

    addMessage(actionText, 'user');
    const loadingId = addMessage(loadingText, 'ai', true);
    setIsLoading(true);
    
    try {
      let response = '';
      
      switch (action) {
        case 'budget-analysis':
          const currentBudget = budgets.find(budget => {
            const now = new Date();
            return budget.year === now.getFullYear() && 
                   budget.month === now.toISOString().slice(0, 7);
          });
          if (currentBudget) {
            response = await geminiAI.analyzeBudget(currentBudget, expenses);
          } else {
            response = '📋 Bạn chưa có ngân sách cho tháng này.\n\n💡 Hãy tạo ngân sách trước để tôi có thể phân tích chi tiết và đưa ra lời khuyên phù hợp.\n\n🎯 Một ngân sách tốt sẽ giúp bạn:\n• Kiểm soát chi tiêu hiệu quả\n• Đạt được mục tiêu tài chính\n• Tránh chi tiêu vượt mức\n• Tăng khả năng tiết kiệm';
          }
          break;
          
        case 'spending-insights':
          response = await geminiAI.getSpendingInsights(expenses);
          break;
          
        case 'debt-advice':
          if (debts.length > 0) {
            response = await geminiAI.getDebtAdvice(debts);
          } else {
            response = '🎉 Tuyệt vời! Bạn hiện không có khoản vay nợ nào.\n\n✅ Đây là dấu hiệu tích cực cho sức khỏe tài chính của bạn.\n\n💡 Để duy trì tình trạng này:\n• Tiếp tục kiểm soát chi tiêu\n• Xây dựng quỹ dự phòng\n• Tránh vay nợ không cần thiết\n• Đầu tư vào các khoản tiết kiệm có lãi suất tốt';
          }
          break;
          
        case 'financial-tips':
          response = await geminiAI.getPersonalizedTips({ budgets, expenses, debts });
          break;

        case 'savings-plan':
          response = await geminiAI.getFinancialAdvice(
            'Hãy tạo một kế hoạch tiết kiệm cụ thể và khả thi dựa trên tình hình tài chính hiện tại của tôi. Bao gồm mục tiêu ngắn hạn và dài hạn.',
            { budgets, expenses, debts }
          );
          break;

        case 'risk-assessment':
          response = await geminiAI.getFinancialAdvice(
            'Đánh giá mức độ rủi ro tài chính hiện tại của tôi và đưa ra các biện pháp phòng ngừa cụ thể.',
            { budgets, expenses, debts }
          );
          break;
      }

      updateMessage(loadingId, response);
    } catch (error) {
      updateMessage(loadingId, '❌ Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'budget-analysis',
      label: 'Phân tích ngân sách',
      icon: PieChart,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50',
      description: 'Đánh giá chi tiết ngân sách tháng này'
    },
    {
      id: 'spending-insights',
      label: 'Xu hướng chi tiêu',
      icon: TrendingUp,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50',
      description: 'Phân tích thói quen và xu hướng chi tiêu'
    },
    {
      id: 'debt-advice',
      label: 'Tư vấn vay nợ',
      icon: CreditCard,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50',
      description: 'Chiến lược quản lý và thanh toán nợ'
    },
    {
      id: 'financial-tips',
      label: 'Lời khuyên cá nhân',
      icon: Lightbulb,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50',
      description: 'Lời khuyên tài chính phù hợp với bạn'
    },
    {
      id: 'savings-plan',
      label: 'Kế hoạch tiết kiệm',
      icon: Target,
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50',
      description: 'Lập kế hoạch tiết kiệm hiệu quả'
    },
    {
      id: 'risk-assessment',
      label: 'Đánh giá rủi ro',
      icon: Zap,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50',
      description: 'Phân tích và phòng ngừa rủi ro tài chính'
    },
  ];

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 z-50 group touch-manipulation"
      >
        <MessageCircle size={20} className="sm:w-6 sm:h-6" />
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-pulse">
          <Brain size={10} className="sm:w-3 sm:h-3" />
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-2 sm:p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[85vh] sm:h-[700px]'
          } flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-white bg-opacity-20 p-1.5 sm:p-2 rounded-full">
                  <Bot size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">AI Financial Assistant</h3>
                  <p className="text-xs opacity-90 hidden sm:block">Chuyên gia tài chính cá nhân</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1.5 sm:p-2 rounded-lg transition-colors touch-manipulation"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Quick Actions */}
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 font-medium">🚀 Hành động nhanh:</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          disabled={isLoading}
                          className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md ${action.color} touch-manipulation`}
                          title={action.description}
                        >
                          <Icon size={12} className="sm:w-3.5 sm:h-3.5 mx-auto mb-1" />
                          <div className="text-center leading-tight">{action.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white dark:bg-gray-800">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-2.5 sm:p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'ai' && (
                            <div className="flex-shrink-0 mt-0.5">
                              {message.isLoading ? (
                                <Loader size={14} className="text-blue-600 dark:text-blue-400 animate-spin" />
                              ) : (
                                <Bot size={14} className="text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          )}
                          {message.type === 'user' && (
                            <User size={14} className="text-white mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="text-xs sm:text-sm whitespace-pre-wrap">
                              {formatMessageContent(message.content)}
                            </div>
                            <p className={`text-xs mt-1.5 sm:mt-2 ${
                              message.type === 'user' ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Hỏi về tình hình tài chính của bạn..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
                    >
                      <Send size={16} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    💡 Hỏi về ngân sách, chi tiêu, vay nợ hoặc lời khuyên tài chính
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};