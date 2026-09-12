import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserApi, loginUserApi, logoutUserApi, registerUserApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUserApi();
      if (res.data) {
        setUser(res.data);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials) => {
    const res = await loginUserApi(credentials);
    const token = res.data?.accessToken || res.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    const userData = res.data?.user || res.data;
    setUser(userData);
    setAuthModalOpen(false);
    return res;
  };

  const register = async (formData) => {
    const res = await registerUserApi(formData);
    setAuthModalTab('login');
    return res;
  };

  const logout = async () => {
    try {
      await logoutUserApi();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        fetchCurrentUser,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        uploadModalOpen,
        setUploadModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
