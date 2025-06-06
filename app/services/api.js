import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.removeItem("authToken");
      // Navigate to login screen
      // navigation.navigate('Login');
    }

    // Log error for debugging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  },
);

// API methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (email, password) => api.post("/auth/login", { email, password }),

    register: (userData) => api.post("/auth/register", userData),

    logout: () => api.post("/auth/logout"),

    refreshToken: () => api.post("/auth/refresh"),
  },

  // Shopping lists
  lists: {
    getAll: () => api.get("/lists"),

    getById: (id) => api.get(`/lists/${id}`),

    create: (data) => api.post("/lists", data),

    update: (id, data) => api.put(`/lists/${id}`, data),

    delete: (id) => api.delete(`/lists/${id}`),
  },

  // Shopping items
  items: {
    getByListId: (listId) => api.get(`/lists/${listId}/items`),

    create: (listId, data) => api.post(`/lists/${listId}/items`, data),

    update: (listId, itemId, data) =>
      api.put(`/lists/${listId}/items/${itemId}`, data),

    delete: (listId, itemId) => api.delete(`/lists/${listId}/items/${itemId}`),

    togglePurchased: (listId, itemId) =>
      api.patch(`/lists/${listId}/items/${itemId}/toggle`),
  },
};

export default api;
