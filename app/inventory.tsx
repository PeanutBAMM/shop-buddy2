import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Plus,
  Minus,
  Search,
  Camera,
  AlertTriangle,
  Package,
  Calendar,
} from "lucide-react-native";
import AppLayout from "./components/AppLayout";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type InventoryItem = Database["public"]["Tables"]["inventory"]["Row"];

export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription ref
  const inventoryChannel = useRef<RealtimeChannel | null>(null);

  const categories = [
    "Alle",
    "Zuivel",
    "Groenten",
    "Fruit",
    "Vlees",
    "Droog",
    "Diepvries",
  ];

  useEffect(() => {
    fetchInventory();
    setupRealtimeSubscriptions();

    // Cleanup subscriptions on unmount
    return () => {
      if (inventoryChannel.current) {
        supabase.removeChannel(inventoryChannel.current);
      }
    };
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      Alert.alert("Error", "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to inventory changes with throttling
    inventoryChannel.current = supabase
      .channel("inventory_changes", {
        config: {
          broadcast: { self: false },
          presence: { key: "inventory" },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory",
        },
        (payload) => {
          // Throttle updates to prevent memory issues
          setTimeout(() => {
            handleInventoryRealtimeChange(payload);
          }, 100);
        },
      )
      .subscribe();
  };

  const handleInventoryRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case "INSERT":
        if (newRecord) {
          setInventory((prev) => [newRecord, ...prev]);
        }
        break;
      case "UPDATE":
        if (newRecord) {
          setInventory((prev) =>
            prev.map((item) => (item.id === newRecord.id ? newRecord : item)),
          );
        }
        break;
      case "DELETE":
        if (oldRecord) {
          setInventory((prev) =>
            prev.filter((item) => item.id !== oldRecord.id),
          );
        }
        break;
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Alle" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter((item) => item.low_stock);
  const expiringItems = inventory.filter((item) => {
    if (!item.expiry_date) return false;
    const today = new Date();
    const expiry = new Date(item.expiry_date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const handleUpdateQuantity = async (itemId: string, change: number) => {
    try {
      const item = inventory.find((i) => i.id === itemId);
      if (!item) return;

      const newQuantity = Math.max(0, item.quantity + change);
      const { error } = await supabase
        .from("inventory")
        .update({
          quantity: newQuantity,
          low_stock: newQuantity <= 2,
        })
        .eq("id", itemId);

      if (error) throw error;
      fetchInventory();
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const handleScanReceipt = () => {
    Alert.alert("Bon scannen", "Camera wordt geopend om bon te scannen...");
  };

  const handleAddItem = () => {
    Alert.alert(
      "Item toevoegen",
      "Functionaliteit voor nieuw item wordt toegevoegd...",
    );
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    const isExpiringSoon =
      item.expiry_date && expiringItems.some((exp) => exp.id === item.id);

    return (
      <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500">{item.category}</Text>
            {item.expiry_date && (
              <View className="flex-row items-center mt-1">
                <Calendar
                  size={12}
                  color={isExpiringSoon ? "#EF4444" : "#6B7280"}
                />
                <Text
                  className={`text-xs ml-1 ${
                    isExpiringSoon ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  Vervalt: {item.expiry_date}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center">
            {item.low_stock && (
              <AlertTriangle size={16} color="#F59E0B" className="mr-2" />
            )}
            {isExpiringSoon && (
              <AlertTriangle size={16} color="#EF4444" className="mr-2" />
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="bg-red-100 rounded-full w-8 h-8 items-center justify-center"
              onPress={() => handleUpdateQuantity(item.id, -1)}
            >
              <Minus size={16} color="#EF4444" />
            </TouchableOpacity>
            <Text className="mx-4 text-lg font-semibold">
              {item.quantity} {item.unit}
            </Text>
            <TouchableOpacity
              className="bg-green-100 rounded-full w-8 h-8 items-center justify-center"
              onPress={() => handleUpdateQuantity(item.id, 1)}
            >
              <Plus size={16} color="#10B981" />
            </TouchableOpacity>
          </View>

          {item.low_stock && (
            <TouchableOpacity
              className="bg-blue-50 px-3 py-1 rounded-full"
              onPress={async () => {
                try {
                  const { data: lists, error } = await supabase
                    .from("shopping_lists")
                    .select("id")
                    .limit(1);

                  if (error) throw error;
                  if (!lists || lists.length === 0) {
                    Alert.alert("Error", "No shopping lists found");
                    return;
                  }

                  const { error: insertError } = await supabase
                    .from("shopping_items")
                    .insert({
                      list_id: lists[0].id,
                      name: item.name,
                      quantity: "1",
                      completed: false,
                    });

                  if (insertError) throw insertError;
                  Alert.alert(
                    "Toevoegen aan lijst",
                    `${item.name} is toegevoegd aan je boodschappenlijst`,
                  );
                } catch (error) {
                  console.error("Error adding to list:", error);
                  Alert.alert("Error", "Failed to add item to shopping list");
                }
              }}
            >
              <Text className="text-blue-600 text-sm font-medium">+ Lijst</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppLayout>
        <StatusBar style="auto" />
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="px-4 py-6 bg-white border-b border-gray-200">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Voorraad
                </Text>
                <Text className="text-gray-600 mt-1">
                  {inventory.length} items in voorraad
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  className="bg-green-500 rounded-full w-12 h-12 items-center justify-center mr-2"
                  onPress={handleScanReceipt}
                >
                  <Camera size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-blue-500 rounded-full w-12 h-12 items-center justify-center"
                  onPress={handleAddItem}
                >
                  <Plus size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search */}
            <View className="flex-row items-center bg-gray-100 rounded-lg p-3 mb-4">
              <Search size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Zoek in voorraad..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    className={`px-4 py-2 rounded-full mr-2 ${
                      selectedCategory === category
                        ? "bg-blue-500"
                        : "bg-gray-100"
                    }`}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      className={`font-medium ${
                        selectedCategory === category
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Alerts */}
          {(lowStockItems.length > 0 || expiringItems.length > 0) && (
            <View className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
              {lowStockItems.length > 0 && (
                <Text className="text-yellow-800 text-sm mb-1">
                  ⚠️ {lowStockItems.length} items hebben weinig voorraad
                </Text>
              )}
              {expiringItems.length > 0 && (
                <Text className="text-red-800 text-sm">
                  🕒 {expiringItems.length} items vervallen binnenkort
                </Text>
              )}
            </View>
          )}

          {/* Inventory List */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredInventory}
              renderItem={renderInventoryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </AppLayout>
    </SafeAreaView>
  );
}
