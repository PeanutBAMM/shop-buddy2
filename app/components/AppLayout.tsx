import React, { ReactNode } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
  Home,
  BookOpen,
  Package,
  Receipt,
  User,
  Settings,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";

interface AppLayoutProps {
  children: ReactNode;
  username?: string;
  context?: string;
}

export default function AppLayout({
  children,
  username = "User",
  context = "At home",
}: AppLayoutProps) {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.error(`Navigation error to ${route}:`, error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200 bg-white">
        <View className="flex-row items-center">
          <Text className="text-lg font-semibold">Hi, {username}</Text>
          <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
            <Text className="text-xs text-blue-800">{context}</Text>
          </View>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className="mr-4"
            onPress={() => handleNavigation("/")}
          >
            <Home size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation("/settings")}>
            <Settings size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1">{children}</View>

      {/* Footer Navigation */}
      <View className="flex-row justify-around items-center py-3 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className="items-center"
          onPress={() => handleNavigation("/recipes")}
        >
          <BookOpen size={24} color="#6B7280" />
          <Text className="text-xs mt-1 text-gray-500">Recipes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => handleNavigation("/inventory")}
        >
          <Package size={24} color="#6B7280" />
          <Text className="text-xs mt-1 text-gray-500">Inventory</Text>
        </TouchableOpacity>

        {/* AI Buddy - Center Button */}
        <TouchableOpacity
          className="items-center -mt-5"
          onPress={() => handleNavigation("/shopping-lists")}
        >
          <View className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
            <Text className="text-white font-bold text-xl">AI</Text>
          </View>
          <Text className="text-xs mt-1 text-blue-500 font-medium">
            AI Buddy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => handleNavigation("/receipts")}
        >
          <Receipt size={24} color="#6B7280" />
          <Text className="text-xs mt-1 text-gray-500">Receipts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => handleNavigation("/profile")}
        >
          <User size={24} color="#6B7280" />
          <Text className="text-xs mt-1 text-gray-500">Profiel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
