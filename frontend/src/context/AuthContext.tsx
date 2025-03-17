import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  userId: string | null;
  login: (token: string, userType: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userId: null,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in on app load
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    const storedUserId = localStorage.getItem('userId');

    if (token) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUserId(storedUserId);
    }
  }, []);

  const login = (token: string, userType: string, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', userType);
    localStorage.setItem('userId', userId);
    
    setIsAuthenticated(true);
    setUserType(userType);
    setUserId(userId);

    // Redirect to profile page after login
    navigate('/profile');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    
    setIsAuthenticated(false);
    setUserType(null);
    setUserId(null);
    
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 