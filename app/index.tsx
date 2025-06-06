import React, { useState, useEffect, useRef } from "react";
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
  Search,
  ShoppingCart,
  Calendar,
  Heart,
  Trash2,
  Share2,
  Plus,
  Mic,
  Camera,
  Edit2,
  Check,
  ChevronDown,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

import AppLayout from "./components/AppLayout";

// Integration Notes for Tempo AI:
// 1. Connect to your Supabase client instance
// 2. Import authentication hooks from your auth provider
// 3. Replace mock data with Supabase queries to these tables:
//    - daily_hero_content (for hero section)
//    - shopping_lists (user's lists with realtime sync)
//    - shopping_list_items (list items)
//    - assistant_categories (AI quick actions)
//    - product_suggestions (personalized products)
//    - user_behavior_logs (track user actions)
// 4. Connect to Tempo AI for chat functionality
// 5. Implement Supabase Edge Functions for:
//    - Daily hero content rotation
//    - Photo processing for inventory
//    - AI-powered category suggestions

// Mock data - TO BE REPLACED with Supabase queries
const mockHeroContent = {
  imageUrl:
    "https://images.unsplash.com/photo-1543168256-418811576931?w=1200&h=600&fit=crop",
  headerText: "Deze week in de bonus bij AH!",
  subText: "Ontdek onze weekaanbiedingen en bespaar tot 40% op verse producten",
  showCTA: true,
  ctaText: "Voeg toe aan boodschappenlijst",
};

const mockAssistantCategories = [
  { id: 1, label: "Winkelijst toevoegen", icon: "🛒", action: "add_to_list" },
  { id: 2, label: "Recept genereren", icon: "👨‍🍳", action: "generate_recipe" },
  {
    id: 3,
    label: "Voorraad bijwerken",
    icon: "📷",
    action: "update_inventory",
  },
];

const mockProductSuggestions = [
  {
    id: 1,
    name: "Biologische Melk",
    category: "Zuivel",
    categoryColor: "#4FC3F7",
    categoryIcon: "🥛",
    quantity: "1,5 L",
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    name: "Verse Broccoli",
    category: "Groenten",
    categoryColor: "#81C784",
    categoryIcon: "🥦",
    quantity: "500 gram",
    image:
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=200&h=200&fit=crop",
  },
  {
    id: 3,
    name: "Volkoren Brood",
    category: "Bakkerij",
    categoryColor: "#FFB74D",
    categoryIcon: "🍞",
    quantity: "800 gram",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
  },
  {
    id: 4,
    name: "Kipfilet",
    category: "Vlees",
    categoryColor: "#F06292",
    categoryIcon: "🍗",
    quantity: "1 kg",
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop",
  },
  {
    id: 5,
    name: "Griekse Yoghurt",
    category: "Zuivel",
    categoryColor: "#4FC3F7",
    categoryIcon: "🥛",
    quantity: "500 ml",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop",
  },
  {
    id: 6,
    name: "Avocado",
    category: "Groenten",
    categoryColor: "#81C784",
    categoryIcon: "🥑",
    quantity: "2 stuks",
    image:
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop",
  },
  {
    id: 7,
    name: "Pasta Penne",
    category: "Kruidenierswaren",
    categoryColor: "#9575CD",
    categoryIcon: "🍝",
    quantity: "500 gram",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop",
  },
  {
    id: 8,
    name: "Zalm Filet",
    category: "Vis",
    categoryColor: "#4DD0E1",
    categoryIcon: "🐟",
    quantity: "250 gram",
    image:
      "https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?w=200&h=200&fit=crop",
  },
  {
    id: 9,
    name: "Bananen",
    category: "Fruit",
    categoryColor: "#FFD54F",
    categoryIcon: "🍌",
    quantity: "1 kg",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
  },
  {
    id: 10,
    name: "Kaas Jong Belegen",
    category: "Zuivel",
    categoryColor: "#4FC3F7",
    categoryIcon: "🧀",
    quantity: "400 gram",
    image:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop",
  },
];

const mockShoppingLists = [
  {
    id: 1,
    name: "Weekboodschappen",
    itemCount: 12,
    isFavorite: true,
    items: [
      {
        id: 1,
        name: "Melk",
        quantity: "2L",
        checked: false,
        category: "Zuivel",
      },
      {
        id: 2,
        name: "Brood",
        quantity: "1 stuk",
        checked: true,
        category: "Bakkerij",
      },
      {
        id: 3,
        name: "Appels",
        quantity: "1 kg",
        checked: false,
        category: "Fruit",
      },
      {
        id: 4,
        name: "Pasta",
        quantity: "500g",
        checked: false,
        category: "Kruidenierswaren",
      },
      {
        id: 5,
        name: "Tomaten",
        quantity: "6 stuks",
        checked: false,
        category: "Groenten",
      },
    ],
  },
  {
    id: 2,
    name: "BBQ Zaterdag",
    itemCount: 8,
    isFavorite: false,
    items: [
      {
        id: 6,
        name: "Hamburgers",
        quantity: "8 stuks",
        checked: false,
        category: "Vlees",
      },
      {
        id: 7,
        name: "BBQ Saus",
        quantity: "1 fles",
        checked: false,
        category: "Sauzen",
      },
      {
        id: 8,
        name: "Stokbrood",
        quantity: "2 stuks",
        checked: false,
        category: "Bakkerij",
      },
    ],
  },
  {
    id: 3,
    name: "Gezonde Snacks",
    itemCount: 5,
    isFavorite: false,
    items: [
      {
        id: 9,
        name: "Noten Mix",
        quantity: "200g",
        checked: false,
        category: "Snacks",
      },
      {
        id: 10,
        name: "Fruit Salade",
        quantity: "1 bak",
        checked: false,
        category: "Fruit",
      },
    ],
  },
];

const mockRecipes = [
  {
    id: 1,
    title: "Pasta Carbonara",
    image:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
    prepTime: "20 min",
    servings: "4 personen",
    ingredients: [
      { name: "Spaghetti", amount: "400g" },
      { name: "Eieren", amount: "4 stuks" },
      { name: "Spek", amount: "200g" },
      { name: "Parmezaanse kaas", amount: "100g" },
      { name: "Zwarte peper", amount: "naar smaak" },
    ],
    instructions:
      "1. Kook de spaghetti volgens de verpakking.\n2. Bak het spek knapperig in een pan.\n3. Klop de eieren met de kaas.\n4. Meng de warme pasta met het spek.\n5. Voeg het eimengsel toe en roer snel.\n6. Breng op smaak met peper.",
  },
  {
    id: 2,
    title: "Griekse Salade",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
    prepTime: "15 min",
    servings: "2 personen",
    ingredients: [
      { name: "Tomaten", amount: "4 stuks" },
      { name: "Komkommer", amount: "1 stuk" },
      { name: "Feta", amount: "200g" },
      { name: "Olijven", amount: "100g" },
      { name: "Rode ui", amount: "1 stuk" },
      { name: "Olijfolie", amount: "4 el" },
    ],
    instructions:
      "1. Snijd de tomaten in partjes.\n2. Snijd de komkommer in halve plakjes.\n3. Snijd de rode ui in dunne ringen.\n4. Verkruimel de feta.\n5. Meng alles in een grote kom.\n6. Besprenkel met olijfolie en serveer.",
  },
];

export default function HomePage() {
  const router = useRouter();

  // Integration: Get authenticated user from your auth provider
  // const user = getCurrentUser();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State management
  const [chatMessages, setChatMessages] = useState([
    {
      type: "assistant",
      text: "Hallo! Ik ben Shop Buddy, je slimme boodschappen assistent. Hoe kan ik je vandaag helpen?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expandedList, setExpandedList] = useState(null);
  const [showIngredientConfirmation, setShowIngredientConfirmation] =
    useState(false);
  const [addedIngredients, setAddedIngredients] = useState([]);
  const [selectedListForIngredients, setSelectedListForIngredients] =
    useState(1);
  const [showRecipes, setShowRecipes] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [lists, setLists] = useState(mockShoppingLists);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const chatEndRef = useRef(null);

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, []);

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

  // Integration Points for Supabase Queries:
  //
  // 1. Fetch hero content:
  // const heroContent = await supabase
  //   .from('daily_hero_content')
  //   .select('*')
  //   .order('created_at', { ascending: false })
  //   .limit(1)
  //   .single();
  //
  // 2. Fetch user's shopping lists with realtime:
  // const { data: shoppingLists } = await supabase
  //   .from('shopping_lists')
  //   .select('*, shopping_list_items(*)')
  //   .eq('user_id', user.id)
  //   .order('created_at', { ascending: false });
  //
  // 3. Subscribe to realtime changes:
  // supabase
  //   .channel('shopping_lists_changes')
  //   .on('postgres_changes', {
  //     event: '*',
  //     schema: 'public',
  //     table: 'shopping_lists',
  //     filter: `user_id=eq.${user.id}`
  //   }, handleRealtimeUpdate)
  //   .subscribe();
  //
  // 4. Fetch assistant categories:
  // const { data: categories } = await supabase
  //   .from('assistant_categories')
  //   .select('*')
  //   .eq('user_id', user.id)
  //   .limit(3);
  //
  // 5. Fetch product suggestions:
  // const { data: suggestions } = await supabase
  //   .from('product_suggestions')
  //   .select('*')
  //   .eq('user_id', user.id)
  //   .limit(10);

  const handleQuickAction = async (action) => {
    let userMessage = "";
    let assistantResponse = "";

    // Integration: Log user behavior to Supabase
    // await supabase
    //   .from('user_behavior_logs')
    //   .insert({
    //     user_id: user.id,
    //     action_type: action,
    //     timestamp: new Date().toISOString()
    //   });

    switch (action) {
      case "add_to_list":
        userMessage = "Ik wil producten toevoegen aan mijn boodschappenlijst";
        assistantResponse =
          "Natuurlijk! Welke producten wil je toevoegen? Je kunt ze één voor één noemen of een hele lijst geven.";
        break;
      case "generate_recipe":
        userMessage = "Genereer een recept voor me";
        assistantResponse = "Ik heb twee heerlijke recepten voor je gevonden:";
        setShowRecipes(true);
        // Integration: Call Tempo AI for recipe generation
        // const recipes = await tempoAI.generateRecipes({
        //   userId: user.id,
        //   preferences: user.preferences
        // });
        break;
      case "update_inventory":
        userMessage = "Ik wil mijn voorraad bijwerken";
        assistantResponse =
          "Prima! Je kunt een foto maken van je voorraadkast of koelkast, en ik help je bij te houden wat je hebt.";
        // Integration: Trigger camera and process with Supabase Edge Function
        // const photo = await capturePhoto();
        // const { data } = await supabase.functions.invoke('process-inventory', {
        //   body: { photo, userId: user.id }
        // });
        break;
    }

    setChatMessages((prev) => [
      ...prev,
      { type: "user", text: userMessage },
      { type: "assistant", text: assistantResponse },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setChatMessages((prev) => [...prev, { type: "user", text: inputText }]);
    setInputText("");
    setIsTyping(true);

    try {
      // Integration: Send message to Tempo AI
      // const response = await tempoAI.chat({
      //   message: inputText,
      //   userId: user.id,
      //   context: {
      //     shoppingLists: lists,
      //     recentActions: [] // Get from user_behavior_logs
      //   }
      // });

      // Simulate AI response for now
      setTimeout(() => {
        if (
          inputText.toLowerCase().includes("melk") ||
          inputText.toLowerCase().includes("brood")
        ) {
          setAddedIngredients([
            { name: "Melk", quantity: "2L", category: "Zuivel", image: "🥛" },
            {
              name: "Brood",
              quantity: "1 stuk",
              category: "Bakkerij",
              image: "🍞",
            },
          ]);
          // Integration: AI determines best list based on context
          // const bestListId = await tempoAI.suggestList({
          //   items: addedIngredients,
          //   lists: lists,
          //   userId: user.id
          // });
          setSelectedListForIngredients(1);
          setShowIngredientConfirmation(true);
          setChatMessages((prev) => [
            ...prev,
            {
              type: "assistant",
              text: "Ik heb melk en brood toegevoegd aan je lijst. Wil je nog meer toevoegen?",
            },
          ]);
        } else {
          setChatMessages((prev) => [
            ...prev,
            {
              type: "assistant",
              text: "Ik begrijp je vraag. Kan je specifieker zijn welke producten je wilt toevoegen?",
            },
          ]);
        }
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Error processing message:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: "Oeps! Er ging iets mis. Probeer het zo opnieuw.",
        },
      ]);
      setIsTyping(false);
    }
  };

  const handleAddToList = async (product, listId = 1) => {
    try {
      // Integration: Add item to Supabase
      // const { data } = await supabase
      //   .from('shopping_list_items')
      //   .insert({
      //     list_id: listId,
      //     product_name: product.name,
      //     quantity: product.quantity,
      //     category: product.category,
      //     user_id: user.id
      //   })
      //   .select()
      //   .single();

      // Update local state optimistically
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? {
                ...list,
                itemCount: list.itemCount + 1,
                items: [
                  ...list.items,
                  {
                    id: Date.now(),
                    name: product.name || product,
                    quantity: product.quantity || "1 stuk",
                    checked: false,
                    category: product.category || "Overig",
                  },
                ],
              }
            : list,
        ),
      );

      Alert.alert(
        "Succes",
        `${product.name || product} toegevoegd aan je lijst!`,
      );
    } catch (error) {
      console.error("Error adding to list:", error);
      Alert.alert("Fout", "Kon item niet toevoegen");
    }
  };

  const toggleListItem = async (listId, itemId) => {
    try {
      // Integration: Update item in Supabase
      // const item = lists.find(l => l.id === listId)?.items.find(i => i.id === itemId);
      // await supabase
      //   .from('shopping_list_items')
      //   .update({ checked: !item.checked })
      //   .eq('id', itemId);

      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId
                    ? { ...item, checked: !item.checked }
                    : item,
                ),
              }
            : list,
        ),
      );
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const deleteListItem = async (listId, itemId) => {
    try {
      // Integration: Delete item from Supabase
      // await supabase
      //   .from('shopping_list_items')
      //   .delete()
      //   .eq('id', itemId);

      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? {
                ...list,
                itemCount: list.itemCount - 1,
                items: list.items.filter((item) => item.id !== itemId),
              }
            : list,
        ),
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const toggleFavorite = async (listId) => {
    try {
      const list = lists.find((l) => l.id === listId);
      // Integration: Update favorite status in Supabase
      // await supabase
      //   .from('shopping_lists')
      //   .update({ is_favorite: !list.isFavorite })
      //   .eq('id', listId);

      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, isFavorite: !list.isFavorite } : list,
        ),
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const createNewList = async () => {
    if (!newListName.trim()) return;

    try {
      // Integration: Create list in Supabase
      // const { data: newListData } = await supabase
      //   .from('shopping_lists')
      //   .insert({
      //     name: newListName,
      //     user_id: user.id,
      //     is_favorite: false
      //   })
      //   .select()
      //   .single();

      const newList = {
        id: Date.now(),
        name: newListName,
        itemCount: 0,
        isFavorite: false,
        items: [],
      };

      setLists((prev) => [...prev, newList]);
      setNewListName("");
      setShowNewListModal(false);
      Alert.alert("Succes", "Nieuwe lijst aangemaakt!");
    } catch (error) {
      console.error("Error creating list:", error);
      Alert.alert("Fout", "Kon lijst niet aanmaken");
    }
  };

  // Integration: Handle image upload for inventory
  const handlePhotoCapture = async (blob) => {
    try {
      // Upload to Supabase Storage
      // const fileName = `inventory/${user.id}/${Date.now()}.jpg`;
      // const { data: uploadData } = await supabase.storage
      //   .from('photos')
      //   .upload(fileName, blob);
      //
      // Process with Edge Function
      // const { data } = await supabase.functions.invoke('process-inventory-photo', {
      //   body: { photoUrl: uploadData.publicUrl, userId: user.id }
      // });

      console.log("Photo processing not yet implemented");
    } catch (error) {
      console.error("Error processing photo:", error);
    }
  };

  const displayedSuggestions = showAllSuggestions
    ? mockProductSuggestions
    : mockProductSuggestions.slice(0, 3);

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppLayout>
        <StatusBar style="auto" />
        <ScrollView className="flex-1 bg-gray-50 pb-20">
          {/* Hero Section */}
          <View className="relative w-full h-48 overflow-hidden">
            <Image
              source={mockHeroContent.imageUrl}
              className="w-full h-full"
              contentFit="cover"
            />
            <View className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4">
              <Text className="text-2xl font-bold text-white mb-1">
                {mockHeroContent.headerText}
              </Text>
              <Text className="text-sm text-white/90 mb-3">
                {mockHeroContent.subText}
              </Text>
              {mockHeroContent.showCTA && (
                <TouchableOpacity className="bg-orange-500 px-5 py-2.5 rounded-full self-start">
                  <Text className="text-white font-semibold text-sm">
                    {mockHeroContent.ctaText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Main Content */}
          <View className="p-4">
            {/* AI Assistant Section */}
            <View className="bg-white rounded-2xl shadow-lg p-4 mb-4">
              {/* Quick Actions - Stacked */}
              <View className="space-y-2 mb-4">
                {mockAssistantCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleQuickAction(category.action)}
                    className="flex-row items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl"
                  >
                    <Sparkles size={16} color="#1D4ED8" />
                    <Text className="text-lg">{category.icon}</Text>
                    <Text className="text-sm font-medium text-blue-700">
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Chat Interface */}
              <View className="bg-gray-50 rounded-xl p-3 h-72 mb-3">
                <ScrollView className="flex-1">
                  {chatMessages.map((message, index) => (
                    <View
                      key={index}
                      className={`mb-3 ${message.type === "user" ? "items-end" : "items-start"}`}
                    >
                      <View
                        className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${
                          message.type === "user"
                            ? "bg-blue-500"
                            : "bg-white shadow-sm"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            message.type === "user"
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {message.text}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {isTyping && (
                    <View className="items-start">
                      <View className="px-4 py-2.5 bg-white rounded-2xl shadow-sm">
                        <Text className="text-gray-500 text-sm">
                          Shop Buddy is aan het typen...
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Recipe Results - Horizontal Scrollable */}
                  {showRecipes && (
                    <ScrollView
                      horizontal
                      className="flex-row gap-3 mt-4"
                      showsHorizontalScrollIndicator={false}
                    >
                      {mockRecipes.map((recipe) => (
                        <TouchableOpacity
                          key={recipe.id}
                          className="bg-white rounded-xl shadow-sm p-3 w-64"
                          onPress={() => setSelectedRecipe(recipe)}
                        >
                          <Image
                            source={recipe.image}
                            className="w-full h-32 rounded-lg mb-2"
                            contentFit="cover"
                          />
                          <Text className="font-semibold text-base mb-1">
                            {recipe.title}
                          </Text>
                          <View className="flex-row items-center gap-2">
                            <Text className="text-xs text-gray-600">
                              ⏱ {recipe.prepTime}
                            </Text>
                            <Text className="text-xs text-gray-600">
                              👥 {recipe.servings}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </ScrollView>
              </View>

              {/* Input Field */}
              <View className="flex-row gap-2">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSendMessage}
                  placeholder="Typ je bericht..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-full text-sm"
                />
                <TouchableOpacity
                  onPress={handleSendMessage}
                  className="bg-blue-500 p-3 rounded-full"
                >
                  <Search size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-100 p-3 rounded-full">
                  <Mic size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Recipe Detail Modal */}
            {selectedRecipe && (
              <View className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <View className="bg-white rounded-2xl p-5 w-full max-w-sm max-h-[80%]">
                  <ScrollView>
                    <View className="flex-row justify-between items-start mb-4">
                      <Text className="text-xl font-semibold flex-1">
                        {selectedRecipe.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedRecipe(null)}
                        className="p-1 ml-2"
                      >
                        <X size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <Image
                      source={selectedRecipe.image}
                      className="w-full h-48 rounded-lg mb-4"
                      contentFit="cover"
                    />

                    <View className="flex-row items-center gap-4 mb-4">
                      <Text className="text-sm text-gray-600">
                        ⏱ {selectedRecipe.prepTime}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        👥 {selectedRecipe.servings}
                      </Text>
                    </View>

                    <View className="mb-4">
                      <Text className="font-semibold mb-2">Ingrediënten:</Text>
                      {selectedRecipe.ingredients.map((ing, idx) => (
                        <View
                          key={idx}
                          className="flex-row justify-between mb-1"
                        >
                          <Text className="text-sm">{ing.name}</Text>
                          <Text className="text-sm text-gray-600">
                            {ing.amount}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View className="mb-4">
                      <Text className="font-semibold mb-2">
                        Bereidingswijze:
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {selectedRecipe.instructions}
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => {
                          setAddedIngredients(
                            selectedRecipe.ingredients.map((ing) => ({
                              name: ing.name,
                              quantity: ing.amount,
                              category: "Ingrediënten",
                              image: "🥘",
                            })),
                          );
                          setSelectedListForIngredients(1);
                          setShowIngredientConfirmation(true);
                          setSelectedRecipe(null);
                        }}
                        className="flex-1 bg-green-500 py-3 rounded-lg flex-row items-center justify-center gap-2"
                      >
                        <ShoppingCart size={16} color="white" />
                        <Text className="text-white font-medium text-sm">
                          Ingrediënten toevoegen
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="bg-blue-500 p-3 rounded-lg">
                        <Calendar size={20} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity className="bg-gray-200 p-3 rounded-lg">
                        <Heart size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Ingredient Confirmation Overlay */}
            {showIngredientConfirmation && (
              <View className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <View className="bg-white rounded-2xl p-5 w-full max-w-sm">
                  <Text className="text-lg font-semibold mb-3">
                    Toegevoegd aan lijst
                  </Text>

                  <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-2">
                      Selecteer lijst:
                    </Text>
                    {/* Note: In React Native, we'd need a picker component here */}
                    <Text className="text-sm text-gray-800">
                      {
                        lists.find((l) => l.id === selectedListForIngredients)
                          ?.name
                      }
                      (
                      {
                        lists.find((l) => l.id === selectedListForIngredients)
                          ?.itemCount
                      }{" "}
                      items)
                    </Text>
                  </View>

                  <ScrollView className="max-h-48 mb-4">
                    {addedIngredients.map((item, index) => (
                      <View
                        key={index}
                        className="flex-row items-center bg-gray-50 rounded-lg p-2.5 mb-2"
                      >
                        <Text className="text-xl mr-3">{item.image}</Text>
                        <View className="flex-1">
                          <Text className="font-medium text-sm">
                            {item.name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {item.quantity} • {item.category}
                          </Text>
                        </View>
                        <TouchableOpacity className="p-1.5">
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        addedIngredients.forEach((ing) =>
                          handleAddToList(ing, selectedListForIngredients),
                        );
                        setShowIngredientConfirmation(false);
                      }}
                      className="flex-1 bg-green-500 py-3 rounded-lg"
                    >
                      <Text className="text-white font-medium text-sm text-center">
                        Bevestigen
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowIngredientConfirmation(false)}
                      className="flex-1 bg-gray-200 py-3 rounded-lg"
                    >
                      <Text className="text-gray-700 font-medium text-sm text-center">
                        Annuleren
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* New List Modal */}
            {showNewListModal && (
              <View className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <View className="bg-white rounded-2xl p-5 w-full max-w-sm">
                  <Text className="text-lg font-semibold mb-4">
                    Nieuwe lijst maken
                  </Text>
                  <TextInput
                    value={newListName}
                    onChangeText={setNewListName}
                    placeholder="Naam van de lijst..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm mb-4"
                    autoFocus
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={createNewList}
                      className="flex-1 bg-blue-500 py-3 rounded-lg"
                    >
                      <Text className="text-white font-medium text-sm text-center">
                        Maken
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowNewListModal(false);
                        setNewListName("");
                      }}
                      className="flex-1 bg-gray-200 py-3 rounded-lg"
                    >
                      <Text className="text-gray-700 font-medium text-sm text-center">
                        Annuleren
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Personalized Suggestions */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">
                Aanbevolen voor jou
              </Text>
              <View className="space-y-3">
                {displayedSuggestions.map((product) => (
                  <View
                    key={product.id}
                    className="bg-white rounded-xl shadow-md p-3 flex-row items-center gap-3"
                  >
                    <Image
                      source={product.image}
                      className="w-16 h-16 rounded-lg"
                      contentFit="cover"
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View
                          className="px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: product.categoryColor }}
                        >
                          <Text className="text-xs font-medium text-white">
                            {product.categoryIcon} {product.category}
                          </Text>
                        </View>
                      </View>
                      <Text className="font-semibold text-sm mb-0.5">
                        {product.name}
                      </Text>
                      <Text className="text-xs text-gray-600">
                        {product.quantity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddToList(product)}
                      className="bg-orange-500 px-4 py-2.5 rounded-lg flex-row items-center gap-1"
                    >
                      <ShoppingCart size={16} color="white" />
                      <Text className="text-white text-sm font-medium">
                        Toevoegen
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {!showAllSuggestions ? (
                <TouchableOpacity
                  onPress={() => setShowAllSuggestions(true)}
                  className="w-full mt-4 bg-gray-100 py-3 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <Text className="text-gray-700 font-medium text-sm">
                    Bekijk alle suggesties
                  </Text>
                  <ChevronDown size={16} color="#6B7280" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowAllSuggestions(false)}
                  className="w-full mt-4 bg-gray-100 py-3 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <Text className="text-gray-700 font-medium text-sm">
                    Minder tonen
                  </Text>
                  <ChevronDown
                    size={16}
                    color="#6B7280"
                    style={{ transform: [{ rotate: "180deg" }] }}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Grocery Lists */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold">
                  Boodschappenlijsten
                </Text>
                <TouchableOpacity
                  onPress={() => setShowNewListModal(true)}
                  className="bg-blue-500 p-2 rounded-lg"
                >
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View
                className={
                  expandedList ? "space-y-3" : "flex-row flex-wrap gap-3"
                }
              >
                {lists.map((list) => (
                  <View
                    key={list.id}
                    className={`bg-white rounded-xl shadow-md overflow-hidden ${
                      expandedList === list.id ? "w-full" : "w-[48%]"
                    }`}
                  >
                    <View className="p-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-semibold text-sm flex-1">
                          {list.name}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <TouchableOpacity
                            onPress={() => toggleFavorite(list.id)}
                            className={`p-1.5 rounded-lg ${
                              list.isFavorite ? "bg-yellow-50" : "bg-gray-100"
                            }`}
                          >
                            <Heart
                              size={16}
                              color={list.isFavorite ? "#EAB308" : "#9CA3AF"}
                              fill={list.isFavorite ? "#EAB308" : "none"}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity className="p-1.5 bg-gray-100 rounded-lg">
                            <Share2 size={16} color="#9CA3AF" />
                          </TouchableOpacity>
                          {expandedList === list.id && (
                            <TouchableOpacity className="p-1.5 bg-gray-100 rounded-lg">
                              <Trash2 size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <Text className="text-xs text-gray-500 mb-2">
                        {list.itemCount} producten
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setExpandedList(
                            expandedList === list.id ? null : list.id,
                          )
                        }
                        className="w-full bg-blue-500 py-2.5 rounded-lg"
                      >
                        <Text className="text-white text-sm font-medium text-center">
                          {expandedList === list.id ? "Sluiten" : "Bekijken"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Expanded List */}
                    {expandedList === list.id && (
                      <View className="border-t border-gray-100 p-3">
                        <View className="flex-row gap-2 mb-3">
                          <TouchableOpacity className="flex-1 bg-gray-100 py-2.5 rounded-lg flex-row items-center justify-center gap-1">
                            <Plus size={16} color="#6B7280" />
                            <Text className="text-gray-700 text-sm font-medium">
                              Toevoegen
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="bg-gray-100 p-2.5 rounded-lg">
                            <Mic size={16} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity className="bg-gray-100 p-2.5 rounded-lg">
                            <Camera size={16} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                        <ScrollView className="max-h-80">
                          {list.items.map((item) => (
                            <View
                              key={item.id}
                              className={`flex-row items-center gap-3 p-2.5 rounded-lg mb-2 ${
                                item.checked
                                  ? "bg-gray-50"
                                  : "bg-white border border-gray-100"
                              }`}
                            >
                              <TouchableOpacity
                                onPress={() => toggleListItem(list.id, item.id)}
                                className={`w-5 h-5 rounded border-2 items-center justify-center ${
                                  item.checked
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {item.checked && (
                                  <Check size={12} color="white" />
                                )}
                              </TouchableOpacity>
                              <View className="flex-1">
                                <Text
                                  className={`font-medium text-sm ${
                                    item.checked
                                      ? "line-through text-gray-400"
                                      : ""
                                  }`}
                                >
                                  {item.name}
                                </Text>
                                <Text className="text-xs text-gray-500">
                                  {item.quantity}
                                </Text>
                              </View>
                              <TouchableOpacity className="p-1.5">
                                <Edit2 size={12} color="#9CA3AF" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => deleteListItem(list.id, item.id)}
                                className="p-1.5"
                              >
                                <Trash2 size={12} color="#9CA3AF" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </AppLayout>
    </SafeAreaView>
  );
}
