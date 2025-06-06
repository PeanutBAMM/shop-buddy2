import AsyncStorage from "@react-native-async-storage/async-storage";

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
      console.error("Cache get error:", error);
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
      console.error("Cache set error:", error);
    }
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Cache remove error:", error);
    }
  },

  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("cache_"));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error("Cache clear error:", error);
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
