import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { PlusCircle, ChevronDown } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

interface ProductSuggestion {
  id: string;
  name: string;
  imageUrl: string;
  category?: string;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  suggestedListId?: string | null;
}

interface ShoppingList {
  id: string;
  name: string;
}

interface ProductSuggestionsProps {
  suggestions?: ProductSuggestion[];
  shoppingLists?: ShoppingList[];
  defaultListId?: string;
  onAddToList?: (productId: string, listId: string) => void;
  onViewAllSuggestions?: () => void;
}

const ProductSuggestions = ({
  suggestions = [
    {
      id: "1",
      name: "Melk",
      imageUrl:
        "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&q=60",
    },
    {
      id: "2",
      name: "Brood",
      imageUrl:
        "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=100&q=60",
    },
    {
      id: "3",
      name: "Eieren",
      imageUrl:
        "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=100&q=60",
    },
    {
      id: "4",
      name: "Kaas",
      imageUrl:
        "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=100&q=60",
    },
  ],
  shoppingLists = [
    { id: "list1", name: "Weekboodschappen" },
    { id: "list2", name: "AH" },
    { id: "list3", name: "Lidl" },
  ],
  defaultListId = "list1",
  onAddToList = () => {},
  onViewAllSuggestions = () => {},
}: ProductSuggestionsProps) => {
  const [selectedListId, setSelectedListId] = React.useState(defaultListId);
  const [showListDropdown, setShowListDropdown] = React.useState<string | null>(
    null,
  );

  const handleAddToList = (productName: string, listId: string) => {
    console.log(`Adding ${productName} to list ${listId}`);
    onAddToList(productName, listId);
    setShowListDropdown(null);
  };

  const getSelectedListName = () => {
    const list = shoppingLists.find((list) => list.id === selectedListId);
    return list ? list.name : "Boodschappenlijst";
  };

  const handleViewAllSuggestions = () => {
    console.log("Navigating to view all suggestions");
    onViewAllSuggestions();
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-800">
          Gepersonaliseerde suggesties
        </Text>
        <TouchableOpacity onPress={handleViewAllSuggestions}>
          <Text className="text-blue-500 text-sm">Alle suggesties</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          {suggestions.slice(0, 4).map((product) => (
            <View
              key={product.id}
              className="w-48 bg-gray-50 rounded-lg overflow-hidden mr-3 relative"
            >
              <Image
                source={{ uri: product.imageUrl }}
                className="w-full h-32 rounded-t-lg"
                contentFit="cover"
              />
              <View className="p-3">
                <Text className="text-sm font-medium text-gray-800 mb-1">
                  {product.name}
                </Text>
                {product.category && (
                  <View
                    className="px-2 py-1 rounded-full mb-2 self-start"
                    style={{
                      backgroundColor: product.categoryColor || "#E5E7EB",
                    }}
                  >
                    <Text className="text-xs text-white font-medium">
                      {product.category}
                    </Text>
                  </View>
                )}
              </View>

              {/* Add Button */}
              <TouchableOpacity
                className="absolute top-2 right-2 bg-blue-500 w-8 h-8 rounded-full items-center justify-center shadow-md"
                onPress={() =>
                  setShowListDropdown(
                    showListDropdown === product.id ? null : product.id,
                  )
                }
              >
                <PlusCircle size={20} color="white" />
              </TouchableOpacity>

              {showListDropdown === product.id && (
                <View className="absolute top-12 right-2 bg-white shadow-lg rounded-md z-20 min-w-32">
                  {shoppingLists.map((list) => (
                    <TouchableOpacity
                      key={list.id}
                      className="px-3 py-2 border-b border-gray-100"
                      onPress={() => handleAddToList(product.name, list.id)}
                    >
                      <Text className="text-xs">{list.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductSuggestions;
