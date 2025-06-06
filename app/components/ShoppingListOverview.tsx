import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Share2,
  Settings,
  Trash2,
  RefreshCw,
  CheckCheck,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type ShoppingList = Database["public"]["Tables"]["shopping_lists"]["Row"] & {
  shopping_items: Database["public"]["Tables"]["shopping_items"]["Row"][];
};

interface ShoppingListOverviewProps {
  onAddList?: () => void;
  onShareList?: (listId: string) => void;
  onSettingsList?: (listId: string) => void;
  onDeleteList?: (listId: string) => void;
}

const ShoppingListOverview = ({
  onAddList = () => {},
  onShareList = () => {},
  onSettingsList = () => {},
  onDeleteList = () => {},
}: ShoppingListOverviewProps) => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [fullWidthListId, setFullWidthListId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();

    // Cleanup function to prevent memory leaks
    return () => {
      setLists([]);
    };
  }, []);

  const fetchLists = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log("No session found");
        setLists([]);
        return;
      }

      // Add timeout to prevent hanging connections
      const fetchPromise = supabase
        .from("shopping_lists")
        .select(
          `
          id,
          name,
          created_at,
          shopping_items(id, name, quantity, completed)
        `,
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fetch timeout")), 15000),
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
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListExpansion = (listId: string) => {
    if (fullWidthListId === listId) {
      setFullWidthListId(null);
      setExpandedListId(null);
    } else {
      setFullWidthListId(listId);
      setExpandedListId(listId);
    }
  };

  const handleAddItem = async (listId: string) => {
    if (newItemText.trim()) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          Alert.alert("Fout", "Niet ingelogd");
          return;
        }

        const { error } = await supabase.from("shopping_items").insert({
          list_id: listId,
          name: newItemText.trim(),
          quantity: "1",
          completed: false,
        });

        if (error) throw error;
        setNewItemText("");
        fetchLists();
        Alert.alert("Succes", "Item toegevoegd!");
      } catch (error) {
        console.error("Error adding item:", error);
        Alert.alert("Fout", "Kon item niet toevoegen");
      }
    }
  };

  const handleToggleItem = async (listId: string, itemId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert("Fout", "Niet ingelogd");
        return;
      }

      const list = lists.find((l) => l.id === listId);
      const item = list?.shopping_items.find((i) => i.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from("shopping_items")
        .update({ completed: !item.completed })
        .eq("id", itemId);

      if (error) throw error;
      fetchLists();
    } catch (error) {
      console.error("Error toggling item:", error);
      Alert.alert("Fout", "Kon item niet bijwerken");
    }
  };

  const handleRegenerateList = async (listId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert("Fout", "Niet ingelogd");
        return;
      }

      // Get completed items from the list
      const list = lists.find((l) => l.id === listId);
      if (!list) return;

      const completedItems = list.shopping_items.filter(
        (item) => item.completed,
      );

      if (completedItems.length === 0) {
        Alert.alert(
          "Geen items",
          "Er zijn geen afgevinkte items om opnieuw toe te voegen",
        );
        return;
      }

      // Remove completed items from current list
      const { error: deleteError } = await supabase
        .from("shopping_items")
        .delete()
        .in(
          "id",
          completedItems.map((item) => item.id),
        );

      if (deleteError) throw deleteError;

      // Add them back as new uncompleted items
      const itemsToReAdd = completedItems.map((item) => ({
        list_id: listId,
        name: item.name,
        quantity: item.quantity || "1",
        completed: false,
      }));

      const { error: insertError } = await supabase
        .from("shopping_items")
        .insert(itemsToReAdd);

      if (insertError) throw insertError;

      fetchLists();
      Alert.alert(
        "Lijst geregenereerd",
        `${completedItems.length} items zijn opnieuw toegevoegd aan je lijst`,
      );
    } catch (error) {
      console.error("Error regenerating list:", error);
      Alert.alert("Fout", "Kon lijst niet regenereren");
    }
  };

  const handleMarkAllAsHad = async (listId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert("Fout", "Niet ingelogd");
        return;
      }

      const list = lists.find((l) => l.id === listId);
      if (!list) return;

      const uncompleted = list.shopping_items.filter((item) => !item.completed);

      if (uncompleted.length === 0) {
        Alert.alert(
          "Alle items al afgevinkt",
          "Alle items in deze lijst zijn al afgevinkt",
        );
        return;
      }

      Alert.alert(
        "Alles afvinken",
        `Wil je alle ${uncompleted.length} items markeren als 'al gehad'?`,
        [
          { text: "Annuleren", style: "cancel" },
          {
            text: "Ja, afvinken",
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from("shopping_items")
                  .update({ completed: true })
                  .eq("list_id", listId)
                  .eq("completed", false);

                if (error) throw error;
                fetchLists();
                Alert.alert("Voltooid", "Alle items zijn afgevinkt");
              } catch (error) {
                console.error("Error marking all as completed:", error);
                Alert.alert("Fout", "Kon items niet afvinken");
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Error marking all as had:", error);
      Alert.alert("Fout", "Kon items niet afvinken");
    }
  };

  const handleDeleteItem = async (listId: string, itemId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert("Fout", "Niet ingelogd");
        return;
      }

      const { error } = await supabase
        .from("shopping_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      fetchLists();
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Fout", "Kon item niet verwijderen");
    }
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Mijn Boodschappenlijsten</Text>
        <TouchableOpacity
          onPress={onAddList}
          className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center"
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text className="text-gray-500 text-center py-4">Laden...</Text>
      ) : lists.length === 0 ? (
        <View className="bg-gray-50 rounded-lg p-6 items-center">
          <Text className="text-gray-500 text-center mb-2">
            Geen lijsten gevonden
          </Text>
          <Text className="text-gray-400 text-sm text-center">
            Maak je eerste boodschappenlijst aan
          </Text>
        </View>
      ) : (
        <View className="space-y-3">
          {lists.map((list) => (
            <View
              key={list.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* List Header */}
              <View className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-800 mb-1">
                      {list.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {list.shopping_items.length} items
                    </Text>
                  </View>
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => handleMarkAllAsHad(list.id)}
                      className="bg-green-100 p-2 rounded-lg"
                    >
                      <CheckCheck size={18} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRegenerateList(list.id)}
                      className="bg-blue-100 p-2 rounded-lg"
                    >
                      <RefreshCw size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onShareList(list.id)}
                      className="bg-gray-100 p-2 rounded-lg"
                    >
                      <Share2 size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onDeleteList(list.id)}
                      className="bg-red-100 p-2 rounded-lg"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Expand/Collapse Button */}
                <TouchableOpacity
                  onPress={() => toggleListExpansion(list.id)}
                  className="flex-row items-center justify-center py-2 bg-gray-50 rounded-lg"
                >
                  <Text className="text-gray-600 mr-2">
                    {expandedListId === list.id ? "Inklappen" : "Uitklappen"}
                  </Text>
                  {expandedListId === list.id ? (
                    <ChevronUp size={16} color="#4b5563" />
                  ) : (
                    <ChevronDown size={16} color="#4b5563" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Expanded List Content */}
              {expandedListId === list.id && (
                <View className="border-t border-gray-100 p-4">
                  {/* List Items */}
                  {list.shopping_items.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row justify-between items-center py-3 border-b border-gray-50"
                    >
                      <TouchableOpacity
                        onPress={() => handleToggleItem(list.id, item.id)}
                        className="flex-row items-center flex-1"
                      >
                        <View
                          className={`w-6 h-6 rounded-full mr-3 items-center justify-center ${item.completed ? "bg-green-500" : "border-2 border-gray-300"}`}
                        >
                          {item.completed && <Check size={16} color="white" />}
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`text-base ${item.completed ? "line-through text-gray-400" : "text-gray-800"}`}
                          >
                            {item.name}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {item.quantity}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteItem(list.id, item.id)}
                        className="p-2"
                      >
                        <Trash2 size={18} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add New Item */}
                  <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">
                    <TextInput
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-3 text-base"
                      placeholder="Nieuw item toevoegen..."
                      value={newItemText}
                      onChangeText={setNewItemText}
                      onSubmitEditing={() => handleAddItem(list.id)}
                    />
                    <TouchableOpacity
                      onPress={() => handleAddItem(list.id)}
                      className="bg-blue-500 px-4 py-3 rounded-lg"
                    >
                      <Text className="text-white font-semibold">
                        Toevoegen
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ShoppingListOverview;
