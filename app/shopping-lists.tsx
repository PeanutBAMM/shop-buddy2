import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Plus,
  Share2,
  MapPin,
  Edit3,
  Trash2,
  Check,
} from "lucide-react-native";
import AppLayout from "./components/AppLayout";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type ShoppingList = Database["public"]["Tables"]["shopping_lists"]["Row"] & {
  shopping_items: Database["public"]["Tables"]["shopping_items"]["Row"][];
};

export default function ShoppingListsScreen() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription refs
  const shoppingListsChannel = useRef<RealtimeChannel | null>(null);
  const shoppingItemsChannel = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    fetchLists();
    setupRealtimeSubscriptions();

    // Cleanup subscriptions on unmount
    return () => {
      if (shoppingListsChannel.current) {
        supabase.removeChannel(shoppingListsChannel.current);
      }
      if (shoppingItemsChannel.current) {
        supabase.removeChannel(shoppingItemsChannel.current);
      }
    };
  }, []);

  const fetchLists = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log("No session found");
        setLists([]);
        return;
      }

      // Add timeout to prevent hanging connections
      const fetchPromise = supabase
        .from("shopping_lists")
        .select(
          `
          *,
          shopping_items (*)
        `,
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Lists fetch timeout")), 15000),
      );

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      setLists(data || []);
    } catch (error) {
      console.error("Error fetching lists:", error);
      Alert.alert("Error", "Failed to load shopping lists");
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    try {
      // Subscribe to shopping_lists changes with throttling and error handling
      shoppingListsChannel.current = supabase
        .channel(`shopping_lists_changes_${Date.now()}`, {
          config: {
            broadcast: { self: false },
            presence: { key: "shopping_lists" },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shopping_lists",
          },
          (payload) => {
            try {
              // Throttle updates to prevent memory issues
              setTimeout(() => {
                handleShoppingListRealtimeChange(payload);
              }, 100);
            } catch (error) {
              console.error(
                "Error handling shopping list realtime change:",
                error,
              );
            }
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Shopping lists realtime subscription active");
          } else if (status === "CHANNEL_ERROR") {
            console.error("Shopping lists realtime subscription error");
          }
        });

      // Subscribe to shopping_items changes with throttling and error handling
      shoppingItemsChannel.current = supabase
        .channel(`shopping_items_changes_${Date.now()}`, {
          config: {
            broadcast: { self: false },
            presence: { key: "shopping_items" },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shopping_items",
          },
          (payload) => {
            try {
              // Throttle updates to prevent memory issues
              setTimeout(() => {
                handleShoppingItemRealtimeChange(payload);
              }, 100);
            } catch (error) {
              console.error(
                "Error handling shopping item realtime change:",
                error,
              );
            }
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Shopping items realtime subscription active");
          } else if (status === "CHANNEL_ERROR") {
            console.error("Shopping items realtime subscription error");
          }
        });
    } catch (error) {
      console.error("Error setting up realtime subscriptions:", error);
    }
  };

  const handleShoppingListRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case "INSERT":
        if (newRecord) {
          const newList: ShoppingList = {
            ...newRecord,
            shopping_items: [],
          };
          setLists((prev) => [newList, ...prev]);
        }
        break;
      case "UPDATE":
        if (newRecord) {
          setLists((prev) =>
            prev.map((list) =>
              list.id === newRecord.id ? { ...list, ...newRecord } : list,
            ),
          );
        }
        break;
      case "DELETE":
        if (oldRecord) {
          setLists((prev) => prev.filter((list) => list.id !== oldRecord.id));
        }
        break;
    }
  };

  const handleShoppingItemRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case "INSERT":
        if (newRecord) {
          setLists((prev) =>
            prev.map((list) =>
              list.id === newRecord.list_id
                ? {
                    ...list,
                    shopping_items: [...list.shopping_items, newRecord],
                  }
                : list,
            ),
          );
        }
        break;
      case "UPDATE":
        if (newRecord) {
          setLists((prev) =>
            prev.map((list) =>
              list.id === newRecord.list_id
                ? {
                    ...list,
                    shopping_items: list.shopping_items.map((item) =>
                      item.id === newRecord.id ? newRecord : item,
                    ),
                  }
                : list,
            ),
          );
        }
        break;
      case "DELETE":
        if (oldRecord) {
          setLists((prev) =>
            prev.map((list) =>
              list.id === oldRecord.list_id
                ? {
                    ...list,
                    shopping_items: list.shopping_items.filter(
                      (item) => item.id !== oldRecord.id,
                    ),
                  }
                : list,
            ),
          );
        }
        break;
    }
  };

  const handleCreateList = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        Alert.alert("Fout", "Niet ingelogd");
        return;
      }

      const { data, error } = await supabase
        .from("shopping_lists")
        .insert({
          name: "Nieuwe lijst",
          user_id: session.user.id,
          shared: false,
        })
        .select()
        .single();

      if (error) throw error;
      fetchLists();
      Alert.alert("Succes", "Nieuwe lijst aangemaakt!");
    } catch (error) {
      console.error("Error creating list:", error);
      Alert.alert("Error", "Failed to create new list");
    }
  };

  const handleShareList = (listId: string) => {
    console.log(`Sharing list: ${listId}`);
    Alert.alert("Lijst delen", "Deelfunctionaliteit wordt geïmplementeerd...");
  };

  const handleOptimizeRoute = (listId: string) => {
    console.log(`Optimizing route for list: ${listId}`);
    Alert.alert("Route optimaliseren", "Route optimalisatie wordt berekend...");
  };

  const handleEditList = (listId: string) => {
    console.log(`Editing list: ${listId}`);
    Alert.alert("Lijst bewerken", "Bewerkingsmodus wordt geopend...");
  };

  const handleDeleteList = (listId: string) => {
    console.log(`Attempting to delete list: ${listId}`);
    Alert.alert(
      "Lijst verwijderen",
      "Weet je zeker dat je deze lijst wilt verwijderen?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession();

              if (!session?.user) {
                Alert.alert("Fout", "Niet ingelogd");
                return;
              }

              const { error } = await supabase
                .from("shopping_lists")
                .delete()
                .eq("id", listId)
                .eq("user_id", session.user.id);

              if (error) throw error;
              fetchLists();
              Alert.alert("Succes", "Lijst verwijderd!");
            } catch (error) {
              console.error("Error deleting list:", error);
              Alert.alert("Error", "Failed to delete list");
            }
          },
        },
      ],
    );
  };

  const renderListItem = ({ item: list }: { item: ShoppingList }) => {
    const completedItems = list.shopping_items.filter(
      (item) => item.completed,
    ).length;
    const totalItems = list.shopping_items.length;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const lastModified = new Date(list.updated_at).toLocaleDateString("nl-NL");

    return (
      <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {list.name}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {completedItems}/{totalItems} items • {lastModified}
            </Text>
            {list.shared && (
              <View className="flex-row items-center mt-1">
                <Share2 size={12} color="#10B981" />
                <Text className="text-xs text-green-600 ml-1">Gedeeld</Text>
              </View>
            )}
          </View>
          <View className="flex-row">
            <TouchableOpacity
              className="p-2"
              onPress={() => handleEditList(list.id)}
            >
              <Edit3 size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2"
              onPress={() => handleDeleteList(list.id)}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="bg-gray-200 rounded-full h-2 mb-3">
          <View
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg"
            onPress={() => handleShareList(list.id)}
          >
            <Share2 size={16} color="#3B82F6" />
            <Text className="text-blue-600 ml-2 font-medium">Delen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center bg-green-50 px-3 py-2 rounded-lg"
            onPress={() => handleOptimizeRoute(list.id)}
          >
            <MapPin size={16} color="#10B981" />
            <Text className="text-green-600 ml-2 font-medium">Route</Text>
          </TouchableOpacity>
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
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Boodschappenlijsten
                </Text>
                <Text className="text-gray-600 mt-1">
                  {lists.length} actieve lijsten
                </Text>
              </View>
              <TouchableOpacity
                className="bg-blue-500 rounded-full w-12 h-12 items-center justify-center"
                onPress={handleCreateList}
              >
                <Plus size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lists */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={lists}
              renderItem={renderListItem}
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
