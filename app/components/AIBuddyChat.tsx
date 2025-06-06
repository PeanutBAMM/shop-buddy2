import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Mic,
  Send,
  Plus,
  Check,
  Calendar,
  Euro,
  ShoppingCart,
  BookOpen,
  Camera,
  Sparkles,
} from "lucide-react-native";
import { Image } from "expo-image";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: string[];
  recipes?: Recipe[];
}

interface Recipe {
  id: string;
  name: string;
  image: string;
  ingredients: string[];
}

interface AssistantCategory {
  id: string;
  category_name: string;
  category_icon: string;
  action_type: string;
  action_data: any;
}

interface AIBuddyChatProps {
  onAddToList?: (items: string[], listId?: string) => void;
  onSaveRecipe?: (recipe: Recipe) => void;
  suggestedListId?: string;
  availableLists?: { id: string; name: string }[];
  assistantCategories?: AssistantCategory[];
  onQuickAction?: (category: AssistantCategory) => void;
}

const AIBuddyChat = ({
  onAddToList = () => {},
  onSaveRecipe = () => {},
  suggestedListId = "default-list",
  availableLists = [{ id: "default-list", name: "Mijn Boodschappenlijst" }],
  assistantCategories = [],
  onQuickAction = () => {},
}: AIBuddyChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hallo! Ik ben je Shop Buddy. Gebruik de knoppen hieronder voor snelle acties, of typ je vraag hieronder.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedListId, setSelectedListId] = useState(suggestedListId);
  const [showListSelector, setShowListSelector] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (message.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Auto scroll to bottom after user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response with typewriter effect
    setTimeout(() => {
      setIsTyping(false);
      let aiResponse: Message;

      // Check if message contains recipe-related keywords
      if (
        message.toLowerCase().includes("recept") ||
        message.toLowerCase().includes("recipe") ||
        message.toLowerCase().includes("koken")
      ) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          text: "Hier zijn enkele receptsuggesties voor je:",
          sender: "ai",
          timestamp: new Date(),
          recipes: [
            {
              id: "recipe-1",
              name: "Pasta Carbonara",
              image:
                "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80",
              ingredients: [
                "Spaghetti",
                "Eieren",
                "Parmezaanse kaas",
                "Pancetta",
                "Zwarte peper",
                "Zout",
              ],
            },
          ],
        };
      }
      // Check if message contains shopping items
      else if (
        message.toLowerCase().includes("koop") ||
        message.toLowerCase().includes("nodig") ||
        message.toLowerCase().includes("halen") ||
        message.toLowerCase().includes("toevoegen")
      ) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          text: "Ik heb deze items herkend. Wil je ze toevoegen aan je boodschappenlijst?",
          sender: "ai",
          timestamp: new Date(),
          suggestions: ["Melk", "Brood", "Eieren", "Kaas"],
        };
      }
      // Check for inventory/voorraad keywords
      else if (
        message.toLowerCase().includes("voorraad") ||
        message.toLowerCase().includes("inventory") ||
        message.toLowerCase().includes("scan")
      ) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          text: "Ik kan je helpen met je voorraad! Scan een bonnetje of voeg handmatig items toe.",
          sender: "ai",
          timestamp: new Date(),
        };
      }
      // Default response
      else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          text: "Ik kan je helpen met boodschappenlijsten, recepten, voorraad beheer en uitgaven. Gebruik de knoppen hierboven voor snelle acties!",
          sender: "ai",
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, aiResponse]);

      // Auto scroll to bottom after AI response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const handleVoiceInput = () => {
    // Placeholder for voice input functionality
    console.log("Voice input activated");
  };

  const handleAddToList = (items: string[]) => {
    onAddToList(items, selectedListId);
    setShowListSelector(false);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    onSaveRecipe(recipe);
  };

  const renderMessage = (message: Message) => {
    return (
      <View
        key={message.id}
        className={`mb-4 p-3 rounded-lg max-w-[80%] ${message.sender === "user" ? "bg-blue-100 self-end" : "bg-gray-100 self-start"}`}
      >
        <Text className="text-base">{message.text}</Text>

        {/* Render recipe cards if available */}
        {message.recipes && message.recipes.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {message.recipes.map((recipe) => (
              <View
                key={recipe.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 mr-3 w-64"
              >
                <TouchableOpacity
                  onPress={() => {
                    // Handle recipe detail view
                    console.log("Opening recipe details for:", recipe.name);
                  }}
                >
                  <Image
                    source={{ uri: recipe.image }}
                    className="w-full h-32"
                    contentFit="cover"
                  />
                  <View className="p-3">
                    <Text
                      className="font-bold text-base mb-1"
                      numberOfLines={2}
                    >
                      {recipe.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      {recipe.ingredients.length} ingrediënten
                    </Text>
                    <View className="flex-row justify-between mt-2">
                      <TouchableOpacity
                        className="bg-blue-500 py-2 px-3 rounded-md flex-row items-center flex-1 mr-1"
                        onPress={() => setShowListSelector(true)}
                      >
                        <Plus size={14} color="white" />
                        <Text className="text-white ml-1 text-xs">
                          Toevoegen
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-green-500 py-2 px-3 rounded-md flex-row items-center flex-1 ml-1"
                        onPress={() => handleSaveRecipe(recipe)}
                      >
                        <Check size={14} color="white" />
                        <Text className="text-white ml-1 text-xs">Opslaan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Render item suggestions if available */}
        {message.suggestions && message.suggestions.length > 0 && (
          <View className="mt-3">
            <View className="flex-row flex-wrap">
              {message.suggestions.map((item, index) => (
                <View
                  key={index}
                  className="bg-white rounded-full py-1 px-3 mr-2 mb-2 border border-gray-200"
                >
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row mt-2">
              <TouchableOpacity
                className="bg-blue-500 py-2 px-3 rounded-md flex-row items-center"
                onPress={() => setShowListSelector(true)}
              >
                <Plus size={16} color="white" />
                <Text className="text-white ml-1">Voeg alle items toe</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 p-4">
        {/* Quick Action Buttons */}
        <View className="flex-row flex-wrap mb-4">
          {assistantCategories.length > 0
            ? assistantCategories.slice(0, 5).map((category, index) => {
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
                const IconComponent = getIconForCategory(
                  category.category_icon,
                );
                return (
                  <TouchableOpacity
                    key={category.id}
                    className="bg-blue-50 border border-blue-200 rounded-full px-3 py-2 mr-2 mb-2 flex-row items-center"
                    onPress={() => onQuickAction(category)}
                  >
                    <IconComponent size={14} color="#3B82F6" />
                    <Text className="text-blue-600 text-xs font-medium ml-1">
                      {category.category_name}
                    </Text>
                  </TouchableOpacity>
                );
              })
            : // Default quick action buttons when no categories are loaded
              [
                { id: "add-items", name: "Items toevoegen", icon: "plus" },
                { id: "meal-plan", name: "Maaltijdplanning", icon: "calendar" },
                { id: "budget", name: "Budget", icon: "euro" },
                { id: "recipes", name: "Recepten", icon: "book-open" },
                { id: "scan", name: "Scannen", icon: "camera" },
              ].map((action) => {
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
                const IconComponent = getIconForCategory(action.icon);
                return (
                  <TouchableOpacity
                    key={action.id}
                    className="bg-blue-50 border border-blue-200 rounded-full px-3 py-2 mr-2 mb-2 flex-row items-center"
                    onPress={() => console.log(`Quick action: ${action.name}`)}
                  >
                    <IconComponent size={14} color="#3B82F6" />
                    <Text className="text-blue-600 text-xs font-medium ml-1">
                      {action.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map(renderMessage)}
          {isTyping && (
            <View className="mb-4 p-3 rounded-lg max-w-[80%] bg-gray-100 self-start">
              <Text className="text-gray-500 italic">Shop Buddy typt...</Text>
            </View>
          )}
        </ScrollView>

        {/* List selector modal */}
        {showListSelector && (
          <View className="absolute bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
            <Text className="font-bold mb-2">Kies een lijst:</Text>
            {availableLists.map((list) => (
              <TouchableOpacity
                key={list.id}
                className={`p-3 mb-1 rounded-md ${selectedListId === list.id ? "bg-blue-100" : "bg-gray-100"}`}
                onPress={() => setSelectedListId(list.id)}
              >
                <Text>{list.name}</Text>
              </TouchableOpacity>
            ))}
            <View className="flex-row justify-between mt-2">
              <TouchableOpacity
                className="bg-gray-500 py-2 px-4 rounded-md"
                onPress={() => setShowListSelector(false)}
              >
                <Text className="text-white">Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 py-2 px-4 rounded-md"
                onPress={() => {
                  const lastMessage = messages[messages.length - 1];
                  if (lastMessage.suggestions) {
                    handleAddToList(lastMessage.suggestions);
                  } else if (
                    lastMessage.recipes &&
                    lastMessage.recipes.length > 0
                  ) {
                    handleAddToList(lastMessage.recipes[0].ingredients);
                  }
                }}
              >
                <Text className="text-white">Bevestigen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Message input */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            className="flex-1 text-base"
            value={message}
            onChangeText={setMessage}
            placeholder="Typ een bericht..."
            multiline
          />
          <TouchableOpacity className="ml-2 p-2" onPress={handleVoiceInput}>
            <Mic size={24} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            className="ml-2 p-2 bg-blue-500 rounded-full"
            onPress={handleSend}
            disabled={message.trim() === ""}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AIBuddyChat;
