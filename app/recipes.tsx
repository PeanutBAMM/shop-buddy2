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
import { Image } from "expo-image";
import {
  Plus,
  Clock,
  Users,
  ChefHat,
  Calendar,
  ShoppingCart,
  Search,
} from "lucide-react-native";
import AppLayout from "./components/AppLayout";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

export default function RecipesScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription ref
  const recipesChannel = useRef<RealtimeChannel | null>(null);

  const categories = ["Alle", "Ontbijt", "Lunch", "Diner", "Snacks", "Dessert"];

  useEffect(() => {
    fetchRecipes();
    setupRealtimeSubscriptions();

    // Cleanup subscriptions on unmount
    return () => {
      if (recipesChannel.current) {
        supabase.removeChannel(recipesChannel.current);
        recipesChannel.current = null;
      }
    };
  }, []);

  const fetchRecipes = async () => {
    try {
      // Add timeout to prevent hanging connections
      const fetchPromise = supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Recipes fetch timeout")), 15000),
      );

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      Alert.alert("Error", "Failed to load recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Only create subscription if one doesn't already exist
    if (recipesChannel.current) {
      return;
    }

    try {
      // Subscribe to recipes changes with throttling and error handling
      recipesChannel.current = supabase
        .channel(`recipes_changes_${Date.now()}`, {
          config: {
            broadcast: { self: false },
            presence: { key: "recipes" },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "recipes",
          },
          (payload) => {
            try {
              // Throttle updates to prevent memory issues
              setTimeout(() => {
                handleRecipeRealtimeChange(payload);
              }, 100);
            } catch (error) {
              console.error("Error handling realtime recipe change:", error);
            }
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Recipes realtime subscription active");
          } else if (status === "CHANNEL_ERROR") {
            console.error("Recipes realtime subscription error");
            // Attempt to reconnect after a delay
            setTimeout(() => {
              if (recipesChannel.current) {
                supabase.removeChannel(recipesChannel.current);
                recipesChannel.current = null;
                setupRealtimeSubscriptions();
              }
            }, 5000);
          }
        });
    } catch (error) {
      console.error("Error setting up realtime subscriptions:", error);
    }
  };

  const handleRecipeRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case "INSERT":
        if (newRecord) {
          setRecipes((prev) => [newRecord, ...prev]);
        }
        break;
      case "UPDATE":
        if (newRecord) {
          setRecipes((prev) =>
            prev.map((recipe) =>
              recipe.id === newRecord.id ? newRecord : recipe,
            ),
          );
        }
        break;
      case "DELETE":
        if (oldRecord) {
          setRecipes((prev) =>
            prev.filter((recipe) => recipe.id !== oldRecord.id),
          );
        }
        break;
    }
  };

  const filteredRecipes =
    selectedCategory === "Alle"
      ? recipes
      : recipes.filter((recipe) => recipe.category === selectedCategory);

  const handleAddRecipe = () => {
    Alert.alert(
      "Recept toevoegen",
      "Functionaliteit voor nieuw recept wordt toegevoegd...",
    );
  };

  const handleRecipePress = (recipe: Recipe) => {
    Alert.alert(recipe.name, "Wat wil je doen?", [
      {
        text: "Bekijk recept",
        onPress: () =>
          Alert.alert("Recept", "Recept details worden getoond..."),
      },
      {
        text: "Ingrediënten toevoegen",
        onPress: () => handleAddIngredients(recipe),
      },
      { text: "Annuleren", style: "cancel" },
    ]);
  };

  const handleAddIngredients = async (recipe: Recipe) => {
    try {
      // Get the first shopping list
      const { data: lists, error: listError } = await supabase
        .from("shopping_lists")
        .select("id")
        .limit(1);

      if (listError) throw listError;
      if (!lists || lists.length === 0) {
        Alert.alert("Error", "No shopping lists found");
        return;
      }

      const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [];
      const itemsToInsert = ingredients.map((ingredient) => ({
        list_id: lists[0].id,
        name: ingredient,
        quantity: "1",
        completed: false,
      }));

      const { error } = await supabase
        .from("shopping_items")
        .insert(itemsToInsert);

      if (error) throw error;
      Alert.alert(
        "Ingrediënten toegevoegd",
        `${ingredients.length} ingrediënten zijn toegevoegd aan je boodschappenlijst`,
      );
    } catch (error) {
      console.error("Error adding ingredients:", error);
      Alert.alert("Error", "Failed to add ingredients to shopping list");
    }
  };

  const handleMealPlanning = () => {
    Alert.alert(
      "Maaltijdplanning",
      "Maaltijdplanning functionaliteit wordt geïmplementeerd...",
    );
  };

  const renderRecipeItem = ({ item: recipe }: { item: Recipe }) => {
    const ingredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : [];
    return (
      <TouchableOpacity
        className="bg-white rounded-lg mb-4 overflow-hidden border border-gray-200"
        onPress={() => handleRecipePress(recipe)}
      >
        <Image
          source={
            recipe.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"
          }
          className="w-full h-48"
          contentFit="cover"
        />
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            {recipe.name}
          </Text>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Clock size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">{recipe.cook_time}</Text>
            </View>
            <View className="flex-row items-center">
              <Users size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">
                {recipe.servings} personen
              </Text>
            </View>
            <View
              className={`px-2 py-1 rounded-full ${
                recipe.difficulty === "Makkelijk"
                  ? "bg-green-100"
                  : recipe.difficulty === "Gemiddeld"
                    ? "bg-yellow-100"
                    : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  recipe.difficulty === "Makkelijk"
                    ? "text-green-800"
                    : recipe.difficulty === "Gemiddeld"
                      ? "text-yellow-800"
                      : "text-red-800"
                }`}
              >
                {recipe.difficulty}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-center bg-blue-50 py-2 rounded-lg"
            onPress={() => handleAddIngredients(recipe)}
          >
            <ShoppingCart size={16} color="#3B82F6" />
            <Text className="text-blue-600 ml-2 font-medium">
              Ingrediënten toevoegen
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
                  Recepten
                </Text>
                <Text className="text-gray-600 mt-1">
                  {filteredRecipes.length} recepten beschikbaar
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  className="bg-green-500 rounded-full w-12 h-12 items-center justify-center mr-2"
                  onPress={handleMealPlanning}
                >
                  <Calendar size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-blue-500 rounded-full w-12 h-12 items-center justify-center"
                  onPress={handleAddRecipe}
                >
                  <Plus size={24} color="white" />
                </TouchableOpacity>
              </View>
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

          {/* Recipes List */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredRecipes}
              renderItem={renderRecipeItem}
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
