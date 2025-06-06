import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "./api";

export const offlineService = {
  queue: [],
  isOnline: true,

  async init() {
    // Listen for network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected && state.isInternetReachable;
      if (this.isOnline) {
        this.syncQueue();
      }
    });

    // Load queued operations
    try {
      const savedQueue = await AsyncStorage.getItem("offlineQueue");
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error("Error loading offline queue:", error);
      this.queue = [];
    }

    return () => {
      try {
        if (unsubscribe && typeof unsubscribe === "function") {
          unsubscribe();
        }
      } catch (error) {
        console.error("Error unsubscribing from network listener:", error);
      }
    };
  },

  async addToQueue(operation) {
    this.queue.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...operation,
    });

    await AsyncStorage.setItem("offlineQueue", JSON.stringify(this.queue));
  },

  async syncQueue() {
    if (!this.isOnline || this.queue.length === 0) return;

    const failedOperations = [];

    for (const operation of this.queue) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        console.error("Sync operation failed:", error);
        failedOperations.push(operation);
      }
    }

    this.queue = failedOperations;
    await AsyncStorage.setItem("offlineQueue", JSON.stringify(this.queue));
  },

  async executeOperation(operation) {
    const { type, data } = operation;

    switch (type) {
      case "CREATE_LIST":
        return apiService.lists.create(data);
      case "UPDATE_LIST":
        return apiService.lists.update(data.id, data);
      case "DELETE_LIST":
        return apiService.lists.delete(data.id);
      case "CREATE_ITEM":
        return apiService.items.create(data.listId, data);
      case "UPDATE_ITEM":
        return apiService.items.update(data.listId, data.itemId, data);
      case "DELETE_ITEM":
        return apiService.items.delete(data.listId, data.itemId);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  },
};
