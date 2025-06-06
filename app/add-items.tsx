import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Type, Mic, Camera, QrCode, Plus } from "lucide-react-native";
import AppLayout from "./components/AppLayout";
import { supabase } from "@/lib/supabase";

export default function AddItemsScreen() {
  const [itemText, setItemText] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("text");

  const inputMethods = [
    { id: "text", label: "Typen", icon: Type, color: "#3B82F6" },
    { id: "voice", label: "Spraak", icon: Mic, color: "#10B981" },
    { id: "scan", label: "Barcode", icon: QrCode, color: "#F59E0B" },
    { id: "photo", label: "Foto", icon: Camera, color: "#EF4444" },
  ];

  const handleAddItem = async () => {
    if (itemText.trim()) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          Alert.alert("Fout", "Niet ingelogd");
          return;
        }

        // Get or create a shopping list
        let { data: lists, error: listsError } = await supabase
          .from("shopping_lists")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1);

        if (listsError) throw listsError;

        let listId;
        if (!lists || lists.length === 0) {
          // Create a new list
          const { data: newList, error: createError } = await supabase
            .from("shopping_lists")
            .insert({
              name: "Mijn Boodschappenlijst",
              user_id: session.user.id,
              shared: false,
            })
            .select("id")
            .single();

          if (createError) throw createError;
          listId = newList.id;
        } else {
          listId = lists[0].id;
        }

        // Add item to the list
        const { error: itemError } = await supabase
          .from("shopping_items")
          .insert({
            list_id: listId,
            name: itemText.trim(),
            quantity: "1",
            completed: false,
          });

        if (itemError) throw itemError;

        Alert.alert(
          "Item toegevoegd",
          `"${itemText}" is toegevoegd aan je boodschappenlijst`,
        );
        setItemText("");
      } catch (error) {
        console.error("Error adding item:", error);
        Alert.alert("Fout", "Kon item niet toevoegen");
      }
    }
  };

  const handleMethodSelect = (method: string) => {
    console.log(`Selected input method: ${method}`);
    setSelectedMethod(method);
    if (method === "voice") {
      Alert.alert("Spraakherkenning", "Spraakherkenning wordt gestart...");
    } else if (method === "scan") {
      Alert.alert(
        "Barcode Scanner",
        "Camera wordt geopend voor barcode scannen...",
      );
    } else if (method === "photo") {
      Alert.alert(
        "Foto Herkenning",
        "Camera wordt geopend voor foto herkenning...",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppLayout>
        <StatusBar style="auto" />
        <ScrollView className="flex-1 bg-white">
          {/* Header */}
          <View className="px-4 py-6 bg-blue-50">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Items Toevoegen
            </Text>
            <Text className="text-gray-600">
              Kies je favoriete manier om items toe te voegen
            </Text>
          </View>

          {/* Input Methods */}
          <View className="px-4 py-6">
            <Text className="text-lg font-semibold mb-4">Invoermethode</Text>
            <View className="flex-row flex-wrap gap-3">
              {inputMethods.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    className={`flex-1 min-w-[45%] p-4 rounded-lg border-2 items-center ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                    onPress={() => handleMethodSelect(method.id)}
                  >
                    <IconComponent
                      size={32}
                      color={isSelected ? "#3B82F6" : method.color}
                    />
                    <Text
                      className={`mt-2 font-medium ${
                        isSelected ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Text Input Section */}
          {selectedMethod === "text" && (
            <View className="px-4 py-6 border-t border-gray-200">
              <Text className="text-lg font-semibold mb-4">Item invoeren</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg p-3">
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Bijv. melk, brood, appels..."
                  value={itemText}
                  onChangeText={setItemText}
                  multiline
                />
                <TouchableOpacity
                  className="ml-3 bg-blue-500 rounded-full w-10 h-10 items-center justify-center"
                  onPress={handleAddItem}
                >
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Quick Add Suggestions */}
          <View className="px-4 py-6">
            <Text className="text-lg font-semibold mb-4">
              Snelle suggesties
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                "Melk",
                "Brood",
                "Eieren",
                "Appels",
                "Bananen",
                "Yoghurt",
                "Kaas",
                "Tomaten",
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  className="bg-gray-100 px-3 py-2 rounded-full"
                  onPress={async () => {
                    try {
                      const {
                        data: { session },
                      } = await supabase.auth.getSession();

                      if (!session?.user) {
                        Alert.alert("Fout", "Niet ingelogd");
                        return;
                      }

                      // Get or create a shopping list
                      let { data: lists, error: listsError } = await supabase
                        .from("shopping_lists")
                        .select("id")
                        .eq("user_id", session.user.id)
                        .limit(1);

                      if (listsError) throw listsError;

                      let listId;
                      if (!lists || lists.length === 0) {
                        // Create a new list
                        const { data: newList, error: createError } =
                          await supabase
                            .from("shopping_lists")
                            .insert({
                              name: "Mijn Boodschappenlijst",
                              user_id: session.user.id,
                              shared: false,
                            })
                            .select("id")
                            .single();

                        if (createError) throw createError;
                        listId = newList.id;
                      } else {
                        listId = lists[0].id;
                      }

                      // Add item to the list
                      const { error: itemError } = await supabase
                        .from("shopping_items")
                        .insert({
                          list_id: listId,
                          name: item,
                          quantity: "1",
                          completed: false,
                        });

                      if (itemError) throw itemError;

                      Alert.alert(
                        "Item toegevoegd",
                        `"${item}" is toegevoegd aan je boodschappenlijst`,
                      );
                    } catch (error) {
                      console.error("Error adding quick item:", error);
                      Alert.alert("Fout", "Kon item niet toevoegen");
                    }
                  }}
                >
                  <Text className="text-gray-700">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </AppLayout>
    </SafeAreaView>
  );
}
