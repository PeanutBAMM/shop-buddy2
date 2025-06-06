import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "./api";

export const authService = {
  async login(email, password) {
    try {
      const response = await apiService.auth.login(email, password);
      const { token, refreshToken, user } = response.data;

      // Store tokens securely
      await AsyncStorage.multiSet([
        ["authToken", token],
        ["refreshToken", refreshToken],
        ["user", JSON.stringify(user)],
      ]);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  async register(userData) {
    try {
      const response = await apiService.auth.register(userData);
      const { token, refreshToken, user } = response.data;

      await AsyncStorage.multiSet([
        ["authToken", token],
        ["refreshToken", refreshToken],
        ["user", JSON.stringify(user)],
      ]);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  },

  async logout() {
    try {
      await apiService.auth.logout();
      await AsyncStorage.multiRemove(["authToken", "refreshToken", "user"]);
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local storage
      await AsyncStorage.multiRemove(["authToken", "refreshToken", "user"]);
      return { success: true };
    }
  },

  async getCurrentUser() {
    try {
      const userString = await AsyncStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem("authToken");
    return !!token;
  },

  async refreshAuthToken() {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const response = await apiService.auth.refreshToken();
      const { token } = response.data;

      await AsyncStorage.setItem("authToken", token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
