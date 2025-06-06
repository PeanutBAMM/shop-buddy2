# Shop Buddy 2 - Backend Issues Analysis & Fixes

## Overview
Based on your Expo React Native project structure, here are the common backend issues and their fixes:

## 1. Database Connection Issues

### Common Problems:
- No proper database configuration
- Missing environment variables
- Incorrect connection strings
- No error handling for failed connections

### Fix: Create a proper database configuration

```javascript
// app/config/database.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

// For SQLite (local database)
export const initializeDatabase = async () => {
  try {
    const db = SQLite.openDatabase('shopbuddy.db');
    
    // Create tables if they don't exist
    db.transaction(tx => {
      // Users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );
      
      // Shopping lists table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS shopping_lists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );
      
      // Shopping items table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS shopping_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          list_id INTEGER,
          name TEXT NOT NULL,
          quantity INTEGER DEFAULT 1,
          price REAL,
          purchased BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (list_id) REFERENCES shopping_lists (id)
        );`
      );
    });
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// For remote database (Firebase/Supabase example)
export const remoteDbConfig = {
  // Firebase config
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  },
  
  // Supabase config
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  }
};
```

## 2. API Connection Issues

### Fix: Create a robust API service

```javascript
// app/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.removeItem('authToken');
      // Navigate to login screen
      // navigation.navigate('Login');
    }
    
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (email, password) => 
      api.post('/auth/login', { email, password }),
    
    register: (userData) => 
      api.post('/auth/register', userData),
    
    logout: () => 
      api.post('/auth/logout'),
    
    refreshToken: () => 
      api.post('/auth/refresh'),
  },
  
  // Shopping lists
  lists: {
    getAll: () => 
      api.get('/lists'),
    
    getById: (id) => 
      api.get(`/lists/${id}`),
    
    create: (data) => 
      api.post('/lists', data),
    
    update: (id, data) => 
      api.put(`/lists/${id}`, data),
    
    delete: (id) => 
      api.delete(`/lists/${id}`),
  },
  
  // Shopping items
  items: {
    getByListId: (listId) => 
      api.get(`/lists/${listId}/items`),
    
    create: (listId, data) => 
      api.post(`/lists/${listId}/items`, data),
    
    update: (listId, itemId, data) => 
      api.put(`/lists/${listId}/items/${itemId}`, data),
    
    delete: (listId, itemId) => 
      api.delete(`/lists/${listId}/items/${itemId}`),
    
    togglePurchased: (listId, itemId) => 
      api.patch(`/lists/${listId}/items/${itemId}/toggle`),
  },
};

export default api;
```

## 3. Authentication Issues

### Fix: Implement proper authentication flow

```javascript
// app/services/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiService.auth.login(email, password);
      const { token, refreshToken, user } = response.data;
      
      // Store tokens securely
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['refreshToken', refreshToken],
        ['user', JSON.stringify(user)],
      ]);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },
  
  async register(userData) {
    try {
      const response = await apiService.auth.register(userData);
      const { token, refreshToken, user } = response.data;
      
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['refreshToken', refreshToken],
        ['user', JSON.stringify(user)],
      ]);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },
  
  async logout() {
    try {
      await apiService.auth.logout();
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local storage
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      return { success: true };
    }
  },
  
  async getCurrentUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },
  
  async refreshAuthToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await apiService.auth.refreshToken();
      const { token } = response.data;
      
      await AsyncStorage.setItem('authToken', token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
```

## 4. State Management Issues

### Fix: Implement proper state management with Context API

```javascript
// app/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';
import { apiService } from '../services/api';

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  shoppingLists: [],
  currentList: null,
  error: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SHOPPING_LISTS':
      return { ...state, shoppingLists: action.payload };
    
    case 'SET_CURRENT_LIST':
      return { ...state, currentList: action.payload };
    
    case 'ADD_LIST':
      return { 
        ...state, 
        shoppingLists: [...state.shoppingLists, action.payload] 
      };
    
    case 'UPDATE_LIST':
      return {
        ...state,
        shoppingLists: state.shoppingLists.map(list =>
          list.id === action.payload.id ? action.payload : list
        ),
        currentList: state.currentList?.id === action.payload.id 
          ? action.payload 
          : state.currentList,
      };
    
    case 'DELETE_LIST':
      return {
        ...state,
        shoppingLists: state.shoppingLists.filter(
          list => list.id !== action.payload
        ),
        currentList: state.currentList?.id === action.payload 
          ? null 
          : state.currentList,
      };
    
    case 'LOGOUT':
      return { ...initialState, loading: false };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  // Fetch shopping lists when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      fetchShoppingLists();
    }
  }, [state.isAuthenticated]);
  
  const fetchShoppingLists = async () => {
    try {
      const response = await apiService.lists.getAll();
      dispatch({ type: 'SET_SHOPPING_LISTS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };
  
  const value = {
    ...state,
    dispatch,
    // Helper functions
    login: async (email, password) => {
      const result = await authService.login(email, password);
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
      }
      return result;
    },
    logout: async () => {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    },
    refreshLists: fetchShoppingLists,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

## 5. Environment Variables

### Fix: Create proper environment configuration

```javascript
// .env.example
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

```javascript
// app.config.js
export default {
  expo: {
    name: "Shop Buddy 2",
    slug: "shop-buddy2",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.peanutbamm.shopbuddy2"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.peanutbamm.shopbuddy2"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      // Add other environment variables you need
    }
  }
};
```

## 6. Error Handling

### Fix: Implement global error handling

```javascript
// app/utils/errorHandler.js
export class AppError extends Error {
  constructor(message, code = 'GENERIC_ERROR', statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const errorHandler = {
  handle: (error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    // Log to crash reporting service (Sentry, Bugsnag, etc.)
    // crashReporting.log(error, context);
    
    // Return user-friendly error message
    if (error.isOperational) {
      return error.message;
    }
    
    // Generic error message for unexpected errors
    return 'Something went wrong. Please try again.';
  },
  
  network: (error) => {
    if (!error.response) {
      return 'Network error. Please check your connection.';
    }
    
    switch (error.response.status) {
      case 400:
        return error.response.data?.message || 'Invalid request';
      case 401:
        return 'Please login to continue';
      case 403:
        return 'You don\'t have permission to do this';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error. Please try again later';
      default:
        return 'Something went wrong';
    }
  },
};
```

## 7. Navigation Guards

### Fix: Implement protected routes

```javascript
// app/navigation/AuthGuard.js
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

export const AuthGuard = ({ children, requireAuth = true }) => {
  const navigation = useNavigation();
  const { isAuthenticated, loading } = useApp();
  
  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else if (!requireAuth && isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    }
  }, [isAuthenticated, loading, requireAuth, navigation]);
  
  if (loading) {
    return null; // Or a loading screen
  }
  
  return children;
};
```

## 8. Data Validation

### Fix: Add input validation

```javascript
// app/utils/validation.js
export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!re.test(email)) return 'Invalid email format';
    return null;
  },
  
  password: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  },
  
  listName: (name) => {
    if (!name || !name.trim()) return 'List name is required';
    if (name.length > 50) return 'List name is too long';
    return null;
  },
  
  itemName: (name) => {
    if (!name || !name.trim()) return 'Item name is required';
    if (name.length > 100) return 'Item name is too long';
    return null;
  },
  
  quantity: (quantity) => {
    if (!quantity || quantity < 1) return 'Quantity must be at least 1';
    if (quantity > 999) return 'Quantity is too large';
    return null;
  },
  
  price: (price) => {
    if (price < 0) return 'Price cannot be negative';
    if (price > 99999) return 'Price is too large';
    return null;
  },
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const error = rules[field](formData[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

## 9. Offline Support

### Fix: Implement offline functionality

```javascript
// app/services/offline.js
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const offlineService = {
  queue: [],
  isOnline: true,
  
  async init() {
    // Listen for network changes
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline) {
        this.syncQueue();
      }
    });
    
    // Load queued operations
    const savedQueue = await AsyncStorage.getItem('offlineQueue');
    if (savedQueue) {
      this.queue = JSON.parse(savedQueue);
    }
  },
  
  async addToQueue(operation) {
    this.queue.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...operation,
    });
    
    await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  },
  
  async syncQueue() {
    if (!this.isOnline || this.queue.length === 0) return;
    
    const failedOperations = [];
    
    for (const operation of this.queue) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        console.error('Sync operation failed:', error);
        failedOperations.push(operation);
      }
    }
    
    this.queue = failedOperations;
    await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  },
  
  async executeOperation(operation) {
    const { type, data } = operation;
    
    switch (type) {
      case 'CREATE_LIST':
        return apiService.lists.create(data);
      case 'UPDATE_LIST':
        return apiService.lists.update(data.id, data);
      case 'DELETE_LIST':
        return apiService.lists.delete(data.id);
      case 'CREATE_ITEM':
        return apiService.items.create(data.listId, data);
      case 'UPDATE_ITEM':
        return apiService.items.update(data.listId, data.itemId, data);
      case 'DELETE_ITEM':
        return apiService.items.delete(data.listId, data.itemId);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  },
};
```

## 10. Performance Optimization

### Fix: Add caching and optimization

```javascript
// app/services/cache.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheService = {
  async get(key) {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;
      
      const { data, timestamp, ttl } = JSON.parse(item);
      
      // Check if cache is expired
      if (ttl && Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },
  
  async set(key, data, ttl = null) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },
  
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },
  
  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
};

// Usage example with API calls
export const cachedApiCall = async (cacheKey, apiCall, ttl = 300000) => {
  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;
  
  // Make API call
  const response = await apiCall();
  
  // Cache the response
  await cacheService.set(cacheKey, response.data, ttl);
  
  return response.data;
};
```

## Testing Your Fixes

After implementing these fixes, test each component:

1. **Database**: Check if tables are created and data persists
2. **API**: Test all endpoints with Postman or similar
3. **Auth**: Verify login/logout flow works correctly
4. **State**: Ensure state updates propagate correctly
5. **Offline**: Test app behavior when offline
6. **Error handling**: Trigger various errors to test handling

## Next Steps

1. Install required dependencies:
```bash
npm install axios @react-native-async-storage/async-storage @react-native-community/netinfo expo-sqlite
```

2. Update your app structure to include these new files
3. Test each component thoroughly
4. Add proper logging and monitoring
5. Consider adding unit and integration tests

Remember to replace placeholder values with your actual API endpoints and configuration!