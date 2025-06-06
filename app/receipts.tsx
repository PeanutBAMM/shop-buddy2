import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import {
  Camera,
  Plus,
  Receipt,
  Calendar,
  DollarSign,
  ShoppingBag,
  Trash2,
  Eye,
} from "lucide-react-native";
import AppLayout from "./components/AppLayout";
import { supabase } from "@/lib/supabase";

interface ReceiptItem {
  id: string;
  storeName: string;
  date: string;
  total: number;
  items: number;
  imageUrl?: string;
  category: string;
}

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([
    {
      id: "1",
      storeName: "Albert Heijn",
      date: "2024-03-20",
      total: 45.67,
      items: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
      category: "Groceries",
    },
    {
      id: "2",
      storeName: "Jumbo",
      date: "2024-03-18",
      total: 32.45,
      items: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
      category: "Groceries",
    },
    {
      id: "3",
      storeName: "Lidl",
      date: "2024-03-15",
      total: 28.9,
      items: 15,
      category: "Groceries",
    },
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState("Deze maand");
  const periods = ["Deze week", "Deze maand", "Dit jaar", "Alles"];

  const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
  const averageSpent = receipts.length > 0 ? totalSpent / receipts.length : 0;

  const handleScanReceipt = () => {
    Alert.alert("Bon scannen", "Kies een optie om je bon toe te voegen", [
      {
        text: "Camera",
        onPress: () => {
          Alert.alert("Camera", "Camera wordt geopend om bon te scannen...", [
            {
              text: "OK",
              onPress: () => {
                // Simulate successful scan
                const newReceipt: ReceiptItem = {
                  id: Date.now().toString(),
                  storeName: "PLUS",
                  date: new Date().toISOString().split("T")[0],
                  total: 23.45,
                  items: 6,
                  category: "Groceries",
                };
                setReceipts([newReceipt, ...receipts]);
                Alert.alert("Succes", "Bon succesvol gescand en toegevoegd!");
              },
            },
          ]);
        },
      },
      {
        text: "Galerij",
        onPress: () => Alert.alert("Galerij", "Foto galerij wordt geopend..."),
      },
      { text: "Annuleren", style: "cancel" },
    ]);
  };

  const handleManualEntry = () => {
    Alert.alert(
      "Handmatig invoeren",
      "Functionaliteit voor handmatige invoer wordt geïmplementeerd...",
    );
  };

  const handleViewReceipt = (receipt: ReceiptItem) => {
    Alert.alert(
      receipt.storeName,
      `Datum: ${receipt.date}\nTotaal: €${receipt.total.toFixed(2)}\nItems: ${receipt.items}`,
      [
        {
          text: "Toevoegen aan voorraad",
          onPress: () =>
            Alert.alert(
              "Voorraad",
              "Items worden toegevoegd aan je voorraad...",
            ),
        },
        { text: "Sluiten", style: "cancel" },
      ],
    );
  };

  const handleDeleteReceipt = (id: string) => {
    Alert.alert(
      "Bon verwijderen",
      "Weet je zeker dat je deze bon wilt verwijderen?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: () => {
            setReceipts(receipts.filter((r) => r.id !== id));
            Alert.alert("Verwijderd", "Bon is verwijderd");
          },
        },
      ],
    );
  };

  const renderReceiptItem = ({ item: receipt }: { item: ReceiptItem }) => {
    return (
      <TouchableOpacity
        className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
        onPress={() => handleViewReceipt(receipt)}
      >
        <View className="flex-row items-center">
          {receipt.imageUrl ? (
            <Image
              source={receipt.imageUrl}
              className="w-16 h-16 rounded-lg mr-4"
              contentFit="cover"
            />
          ) : (
            <View className="w-16 h-16 bg-gray-100 rounded-lg mr-4 items-center justify-center">
              <Receipt size={24} color="#6B7280" />
            </View>
          )}

          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {receipt.storeName}
            </Text>
            <View className="flex-row items-center mt-1">
              <Calendar size={14} color="#6B7280" />
              <Text className="text-gray-600 ml-1 text-sm">
                {new Date(receipt.date).toLocaleDateString("nl-NL")}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <ShoppingBag size={14} color="#6B7280" />
              <Text className="text-gray-600 ml-1 text-sm">
                {receipt.items} items
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-xl font-bold text-green-600">
              €{receipt.total.toFixed(2)}
            </Text>
            <View className="flex-row mt-2">
              <TouchableOpacity
                onPress={() => handleViewReceipt(receipt)}
                className="bg-blue-50 rounded-full w-8 h-8 items-center justify-center mr-2"
              >
                <Eye size={16} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteReceipt(receipt.id)}
                className="bg-red-50 rounded-full w-8 h-8 items-center justify-center"
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
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
                  Bonnetjes
                </Text>
                <Text className="text-gray-600 mt-1">
                  {receipts.length} bonnetjes opgeslagen
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  className="bg-blue-500 rounded-full w-12 h-12 items-center justify-center mr-2"
                  onPress={handleManualEntry}
                >
                  <Plus size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-500 rounded-full w-12 h-12 items-center justify-center"
                  onPress={handleScanReceipt}
                >
                  <Camera size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Period Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {periods.map((period) => (
                  <TouchableOpacity
                    key={period}
                    className={`px-4 py-2 rounded-full mr-2 ${
                      selectedPeriod === period ? "bg-blue-500" : "bg-gray-100"
                    }`}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text
                      className={`font-medium ${
                        selectedPeriod === period
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Statistics */}
          <View className="px-4 py-4 bg-white border-b border-gray-200">
            <View className="flex-row justify-around">
              <View className="items-center">
                <View className="flex-row items-center mb-1">
                  <DollarSign size={16} color="#10B981" />
                  <Text className="text-2xl font-bold text-green-600 ml-1">
                    €{totalSpent.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm">Totaal uitgegeven</Text>
              </View>
              <View className="items-center">
                <View className="flex-row items-center mb-1">
                  <Receipt size={16} color="#3B82F6" />
                  <Text className="text-2xl font-bold text-blue-600 ml-1">
                    {receipts.length}
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm">Bonnetjes</Text>
              </View>
              <View className="items-center">
                <View className="flex-row items-center mb-1">
                  <DollarSign size={16} color="#F59E0B" />
                  <Text className="text-2xl font-bold text-yellow-600 ml-1">
                    €{averageSpent.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm">Gemiddeld</Text>
              </View>
            </View>
          </View>

          {/* Receipts List */}
          <FlatList
            data={receipts}
            renderItem={renderReceiptItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </AppLayout>
    </SafeAreaView>
  );
}
