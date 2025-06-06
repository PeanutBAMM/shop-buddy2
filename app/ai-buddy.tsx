import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import AIBuddyChat from "./components/AIBuddyChat";
import AppLayout from "./components/AppLayout";

type AssistantCategory =
  Database["public"]["Tables"]["assistant_categories"]["Row"];

export default function AIBuddyScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availableLists, setAvailableLists] = useState<
    { id: string; name: string }[]
  >([]);
  const [assistantCategories, setAssistantCategories] = useState<
    AssistantCategory[]
  >([]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth");
        return;
      }

      setUser(session.user);

      // Fetch shopping lists
      const { data: lists, error: listsError } = await supabase
        .from("shopping_lists")
        .select("id, name")
        .eq("user_id", session.user.id)
        .limit(5);

      if (!listsError) {
        setAvailableLists(lists || []);
      }

      // Fetch assistant categories
      const { data: categories, error: categoriesError } = await supabase
        .from("assistant_categories")
        .select("*")
        .eq("user_id", session.user.id)
        .order("display_order", { ascending: true })
        .limit(5);

      if (!categoriesError) {
        setAssistantCategories(categories || []);
      }
    } catch (error) {
      console.error("Error loading AI Buddy data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (items: string[], listId?: string) => {
    if (!user || !items || items.length === 0) {
      Alert.alert("Fout", "Geen items om toe te voegen");
      return;
    }

    try {
      let targetListId = listId || availableLists[0]?.id;

      // If no list exists, create a default one
      if (!targetListId) {
        const { data: newList, error: createError } = await supabase
          .from("shopping_lists")
          .insert({
            name: "Mijn Boodschappenlijst",
            user_id: user.id,
            shared: false,
          })
          .select()
          .single();

        if (createError) throw createError;
        targetListId = newList.id;

        // Refresh available lists
        const { data: listsData, error: listsError } = await supabase
          .from("shopping_lists")
          .select("id, name")
          .eq("user_id", user.id)
          .limit(5);

        if (!listsError) {
          setAvailableLists(listsData || []);
        }
      }

      const itemsToInsert = items.map((item) => ({
        list_id: targetListId,
        name: item || "Onbekend item",
        quantity: "1",
        completed: false,
      }));

      const { error } = await supabase
        .from("shopping_items")
        .insert(itemsToInsert);

      if (error) throw error;
      Alert.alert(
        "Succes",
        `${items.length} items toegevoegd aan je boodschappenlijst`,
      );
    } catch (error) {
      console.error("Error adding items:", error);
      Alert.alert("Fout", "Kon items niet toevoegen");
    }
  };

  const handleSaveRecipe = async (recipe: any) => {
    if (!user || !recipe) {
      Alert.alert("Fout", "Geen recept om op te slaan");
      return;
    }

    try {
      const { error } = await supabase.from("recipes").insert({
        user_id: user.id,
        name: recipe.name || "Onbekend recept",
        image_url: recipe.image || null,
        cook_time: recipe.cook_time || "30 min",
        servings: recipe.servings || 4,
        difficulty: recipe.difficulty || "Gemiddeld",
        ingredients: recipe.ingredients || [],
        category: recipe.category || "Diner",
      });

      if (error) throw error;
      Alert.alert("Succes", "Recept opgeslagen!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Fout", "Kon recept niet opslaan");
    }
  };

  const handleQuickAction = async (category: AssistantCategory) => {
    try {
      console.log("Quick action executed:", category);

      switch (category.action_type) {
        case "add_items":
          router.push("/add-items");
          break;
        case "meal_planning":
          router.push("/recipes");
          break;
        case "budget_tracking":
          Alert.alert("Budget", "Budget tracking functie komt binnenkort!");
          break;
        case "scan_receipt":
          router.push("/receipts");
          break;
        default:
          Alert.alert(
            "Snelle Actie",
            `Actie: ${category.category_name}\nType: ${category.action_type}`,
          );
      }
    } catch (error) {
      console.error("Error executing quick action:", error);
      Alert.alert("Fout", "Er ging iets mis bij het uitvoeren van de actie.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Laden...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppLayout>
        <StatusBar style="auto" />
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="px-4 py-6 bg-white border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">AI Buddy</Text>
            <Text className="text-gray-600 mt-1">
              Je persoonlijke boodschappen assistent
            </Text>
          </View>

          {/* AI Chat Interface */}
          <View className="flex-1">
            <AIBuddyChat
              onAddToList={handleAddToList}
              onSaveRecipe={handleSaveRecipe}
              availableLists={availableLists || []}
              suggestedListId={availableLists?.[0]?.id}
              assistantCategories={assistantCategories}
              onQuickAction={handleQuickAction}
            />
          </View>
        </View>
      </AppLayout>
    </SafeAreaView>
  );
}
