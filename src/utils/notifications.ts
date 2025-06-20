export const notificationUtils = {
  requestPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  showNotification: (title: string, message: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: icon || '/favicon.ico',
        tag: 'finance-tracker',
      });
    }
  },

  checkBudgetAlerts: (categories: any[], threshold: number) => {
    categories.forEach(category => {
      const percentage = (category.spentAmount / category.allocatedAmount) * 100;
      
      if (percentage >= 100) {
        notificationUtils.showNotification(
          'Vượt ngân sách!',
          `Bạn đã vượt ngân sách cho danh mục "${category.name}"`
        );
      } else if (percentage >= threshold) {
        notificationUtils.showNotification(
          'Cảnh báo ngân sách',
          `Bạn đã sử dụng ${percentage.toFixed(0)}% ngân sách cho danh mục "${category.name}"`
        );
      }
    });
  },
};