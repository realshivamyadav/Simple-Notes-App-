import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api'; // 10.0.2.2 is for Android emulator to connect to localhost

interface AuthContextData {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username, password) => Promise<void>;
  signup: (username, password) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token: newToken } = response.data;
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      await AsyncStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const signup = async (username, password) => {
    try {
      await axios.post(`${API_URL}/auth/signup`, { username, password });
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    }
  };

  const logout = async () => {
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
