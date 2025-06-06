import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import {
  Mic,
  Send,
  Plus,
  ShoppingCart,
  BookOpen,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Calendar,
  Euro,
  Camera,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

import AIBuddyChat from "./components/AIBuddyChat";
import ShoppingListOverview from "./components/ShoppingListOverview";
import ProductSuggestions from "./components/ProductSuggestions";
import AppLayout from "./components/AppLayout";

type HeroContent = Database["public"]["Tables"]["daily_hero_content"]["Row"];
type AssistantCategory =
  Database["public"]["Tables"]["assistant_categories"]["Row"];
type ProductSuggestion =
  Database["public"]["Tables"]["product_suggestions"]["Row"];

export default function HomeScreen() {
  const [chatInput, setChatInput] = useState("");
  const [availableLists, setAvailableLists] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [assistantCategories, setAssistantCategories] = useState<
    AssistantCategory[]
  >([]);
  const [productSuggestions, setProductSuggestions] = useState<
    ProductSuggestion[]
  >([]);
  const [heroFadeAnim] = useState(new Animated.Value(0));
  const [heroScaleAnim] = useState(new Animated.Value(0.95));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch shopping lists
        const { data: lists, error: listsError } = await supabase
          .from("shopping_lists")
          .select("id, name")
          .eq("user_id", user.id)
          .limit(5);

        if (listsError) throw listsError;
        setAvailableLists(lists || []);

        // Fetch hero content with proper error handling
        try {
          const { data: heroData, error: heroError } =
            await supabase.functions.invoke(
              "supabase-functions-daily-hero-rotation",
              { body: {} },
            );

          if (!heroError && heroData?.data) {
            setHeroContent(heroData.data);
            // Animate hero section
            Animated.parallel([
              Animated.timing(heroFadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(heroScaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
            ]).start();
          } else if (heroError) {
            console.warn("Hero content fetch error:", heroError);
          }
        } catch (heroFetchError) {
          console.warn("Hero content fetch failed:", heroFetchError);
        }

        // Fetch assistant categories with timeout
        try {
          const categoriesPromise = supabase
            .from("assistant_categories")
            .select("*")
            .eq("user_id", user.id)
            .order("display_order", { ascending: true })
            .limit(5);

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Categories fetch timeout")),
              10000,
            ),
          );

          const { data: categories, error: categoriesError } =
            await Promise.race([categoriesPromise, timeoutPromise]);

          if (!categoriesError && categories) {
            setAssistantCategories(categories);
          } else if (categoriesError) {
            console.warn("Categories fetch error:", categoriesError);
            setAssistantCategories([]);
          }
        } catch (categoriesFetchError) {
          console.warn("Categories fetch failed:", categoriesFetchError);
          setAssistantCategories([]);
        }

        // Fetch product suggestions with timeout
        try {
          const suggestionsPromise = supabase
            .from("product_suggestions")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("prediction_score", { ascending: false })
            .limit(6);

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Suggestions fetch timeout")),
              10000,
            ),
          );

          const { data: suggestions, error: suggestionsError } =
            await Promise.race([suggestionsPromise, timeoutPromise]);

          if (!suggestionsError && suggestions) {
            setProductSuggestions(suggestions);
          } else if (suggestionsError) {
            console.warn("Suggestions fetch error:", suggestionsError);
            setProductSuggestions([]);
          }
        } catch (suggestionsFetchError) {
          console.warn("Suggestions fetch failed:", suggestionsFetchError);
          setProductSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setErrorMessage(
          "Er ging iets mis bij het laden van de dashboard gegevens.",
        );
        setAvailableLists([]);
      }
    };

    fetchDashboardData();
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth");
        return;
      }

      setUser(session.user);

      // Check if user has completed onboarding
      const { data: metadata, error: metadataError } = await supabase
        .from("users_metadata")
        .select("onboarding_status")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (metadataError && metadataError.code !== "PGRST116") {
        console.error("Error fetching user metadata:", metadataError);
        // Continue to home page on error to avoid infinite loops
      }

      console.log("User metadata:", metadata);
      console.log("Onboarding status:", metadata?.onboarding_status);

      // Only redirect to onboarding if:
      // 1. No metadata exists at all (new user), OR
      // 2. Metadata exists but onboarding_status is explicitly false
      if (!metadata || metadata.onboarding_status === false) {
        console.log("Redirecting to onboarding - metadata:", metadata);
        router.replace("/onboarding");
        return;
      }

      // User has completed onboarding, stay on home page
      console.log("User has completed onboarding, loading home page");
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/auth");
    } finally {
      setLoading(false);
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

  // Placeholder user data
  const userData = {
    name: "Thomas",
    context: "In store",
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

  const handleAddList = async () => {
    if (!user) {
      Alert.alert("Fout", "Gebruiker niet ingelogd");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("shopping_lists")
        .insert({
          name: "Nieuwe lijst",
          user_id: user.id,
          shared: false,
        })
        .select()
        .single();

      if (error) throw error;
      Alert.alert("Succes", "Nieuwe lijst aangemaakt!");

      // Refresh available lists
      const { data: listsData, error: listsError } = await supabase
        .from("shopping_lists")
        .select("id, name")
        .eq("user_id", user.id)
        .limit(5);

      if (!listsError) {
        setAvailableLists(listsData || []);
      }
    } catch (error) {
      console.error("Error creating list:", error);
      Alert.alert("Fout", "Kon lijst niet aanmaken");
    }
  };

  const handleShareList = (listId: string) => {
    Alert.alert("Lijst delen", "Deelfunctionaliteit wordt geïmplementeerd...");
  };

  const handleSettingsList = (listId: string) => {
    Alert.alert("Lijst instellingen", "Instellingen worden geopend...");
  };

  const handleDeleteList = async (listId: string) => {
    if (!user) return;

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
              const { error } = await supabase
                .from("shopping_lists")
                .delete()
                .eq("id", listId);

              if (error) throw error;
              Alert.alert("Succes", "Lijst verwijderd!");

              // Refresh available lists
              const { data: listsData, error: listsError } = await supabase
                .from("shopping_lists")
                .select("id, name")
                .eq("user_id", user.id)
                .limit(5);

              if (!listsError) {
                setAvailableLists(listsData || []);
              }
            } catch (error) {
              console.error("Error deleting list:", error);
              Alert.alert("Fout", "Kon lijst niet verwijderen");
            }
          },
        },
      ],
    );
  };

  const handleAddToProductList = async (productId: string, listId: string) => {
    if (!user) {
      Alert.alert("Fout", "Gebruiker niet ingelogd");
      return;
    }

    try {
      // Find product name from suggestions or use productId as fallback
      const productName = productId;

      const { error } = await supabase.from("shopping_items").insert({
        list_id: listId,
        name: productName,
        quantity: "1",
        completed: false,
      });

      if (error) throw error;
      Alert.alert(
        "Succes",
        `${productName} toegevoegd aan je boodschappenlijst`,
      );
    } catch (error) {
      console.error("Error adding product to list:", error);
      Alert.alert("Fout", "Kon product niet toevoegen");
    }
  };

  const handleViewAllSuggestions = () => {
    router.push("/add-items");
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

  const getIconForCategory = (iconName: string) => {
    switch (iconName) {
      case "plus":
        return Plus;
      case "calendar":
        return Calendar;
      case "euro":
        return Euro;
      case "shopping-cart":
        return ShoppingCart;
      case "book-open":
        return BookOpen;
      case "camera":
        return Camera;
      default:
        return Sparkles;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppLayout>
        <StatusBar style="auto" />
        <ScrollView className="flex-1 bg-white">
          {/* Error Message */}
          {errorMessage && (
            <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-2">
              <Text className="text-red-700">{errorMessage}</Text>
            </View>
          )}

          {/* Hero Section */}
          <Animated.View
            className="w-full h-56 bg-blue-500 justify-center items-center mb-4 mx-4 rounded-lg overflow-hidden"
            style={{
              opacity: heroFadeAnim,
              transform: [{ scale: heroScaleAnim }],
              width: "92%",
            }}
          >
            <Image
              source={
                heroContent?.hero_image_url ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
              }
              className="w-full h-full absolute"
              contentFit="cover"
            />
            <View className="bg-black/50 absolute inset-0" />
            <View className="z-10 px-6 text-center flex-1 justify-center">
              <Text className="text-2xl font-bold text-white mb-3 text-center">
                {heroContent?.header_text ||
                  "Welkom bij je slimme boodschappenlijst"}
              </Text>
              <Text className="text-white text-center text-base">
                {heroContent?.subtext || "Wat wil je vandaag kopen?"}
              </Text>
            </View>
          </Animated.View>

          {/* AI Assistant Section */}
          <View className="px-4 mb-6">
            <Text className="text-xl font-bold mb-4">Shop Buddy</Text>

            {/* AI Chat Interface */}
            {user && (
              <View className="bg-white rounded-lg shadow-sm">
                <AIBuddyChat
                  onAddToList={handleAddToList}
                  onSaveRecipe={handleSaveRecipe}
                  availableLists={availableLists || []}
                  suggestedListId={availableLists?.[0]?.id}
                  assistantCategories={assistantCategories}
                  onQuickAction={handleQuickAction}
                />
              </View>
            )}
          </View>

          {/* Personalized Suggestions Section */}
          <View className="px-4 mb-6">
            <ProductSuggestions
              suggestions={
                productSuggestions.length > 0
                  ? productSuggestions.map((suggestion) => ({
                      id: suggestion.id,
                      name: suggestion.product_name,
                      imageUrl:
                        suggestion.image_url ||
                        "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&q=60",
                      category: suggestion.category,
                      categoryIcon: suggestion.category_icon,
                      categoryColor: suggestion.category_color,
                      suggestedListId: suggestion.suggested_list_id,
                    }))
                  : [
                      {
                        id: "default-1",
                        name: "Melk",
                        imageUrl:
                          "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&q=60",
                        category: "Zuivel",
                        categoryColor: "#3B82F6",
                      },
                      {
                        id: "default-2",
                        name: "Brood",
                        imageUrl:
                          "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=100&q=60",
                        category: "Bakkerij",
                        categoryColor: "#F59E0B",
                      },
                    ]
              }
              shoppingLists={availableLists.map((list) => ({
                id: list.id,
                name: list.name,
              }))}
              defaultListId={availableLists?.[0]?.id}
              onAddToList={handleAddToProductList}
              onViewAllSuggestions={handleViewAllSuggestions}
            />
          </View>

          {/* Shopping Lists Section */}
          <View className="px-4 mb-6">
            {user && (
              <ShoppingListOverview
                onAddList={handleAddList}
                onShareList={handleShareList}
                onSettingsList={handleSettingsList}
                onDeleteList={handleDeleteList}
              />
            )}
          </View>
        </ScrollView>
      </AppLayout>
    </SafeAreaView>
  );
}
