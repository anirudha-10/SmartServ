import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkToken = () => {
    const token = localStorage.getItem('token');
    const storedUserRaw = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    let storedUser = null;

    if (storedUserRaw) {
      try {
        storedUser = JSON.parse(storedUserRaw);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }

    if (token) {
      try {
        const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
        const decoded = jwtDecode(cleanToken);
        
        // Check JWT Expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          logout();
          return;
        }

        const role = storedRole || decoded.role || decoded.userRole || storedUser?.role || storedUser?.userRole || 'CUSTOMER';
        const rawUserId = decoded.userId || decoded.id || storedUser?.userId || storedUser?.id || (role === 'CUSTOMER' ? 2 : 1);
        const userId = Number(rawUserId);

        const formattedUser = {
          userId,
          id: userId,
          userName: storedUser?.userName || decoded.sub || decoded.userName || 'User',
          email: storedUser?.email || decoded.email || decoded.sub || '',
          role,
          userRole: role,
          mobile: storedUser?.mobile || ''
        };

        setUser(formattedUser);
      } catch (error) {
        console.error("Token decode error:", error);
        if (storedUser) {
          const role = storedRole || storedUser.role || storedUser.userRole || 'CUSTOMER';
          const rawUserId = storedUser.userId || storedUser.id || (role === 'CUSTOMER' ? 2 : 1);
          const userId = Number(rawUserId);
          const formattedUser = {
            userId,
            id: userId,
            userName: storedUser.userName || 'User',
            email: storedUser.email || '',
            role,
            userRole: role,
            mobile: storedUser.mobile || ''
          };
          setUser(formattedUser);
        } else {
          logout();
        }
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkToken();

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const { token, user: userData } = response.data;
      
      const userRole = userData?.role || userData?.userRole || response.data?.role || response.data?.userRole || role || 'CUSTOMER';
      const rawUserId = userData?.userId || userData?.id || response.data?.userId || response.data?.id || (userRole === 'CUSTOMER' ? 2 : 1);
      const userId = Number(rawUserId);

      const formattedUser = {
        userId,
        id: userId,
        userName: userData?.userName || userData?.firstName || email.split('@')[0],
        email: userData?.email || email,
        role: userRole,
        userRole,
        mobile: userData?.mobile || ''
      };

      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      
      checkToken();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    role: user?.role,
    userId: user?.userId || user?.id,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
