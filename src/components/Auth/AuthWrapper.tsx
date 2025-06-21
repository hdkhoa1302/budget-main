import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { LoadingSpinner } from './LoadingSpinner';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return (
      <LoginForm 
        onToggleMode={() => setIsLogin(!isLogin)} 
        isLogin={isLogin} 
      />
    );
  }

  return <>{children}</>;
};