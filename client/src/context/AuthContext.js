import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`);
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token: newToken, ...userData } = response.data.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return { success: true, user: userData };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, userData);

      if (response.data.success) {
        const { token: newToken, ...userInfo } = response.data.data;
        setToken(newToken);
        setUser(userInfo);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/profile`, profileData);
      if (response.data.success) {
        await loadUserProfile();
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor' || user?.role === 'admin',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
