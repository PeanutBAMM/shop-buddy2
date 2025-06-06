import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Edit3, Trash2, CreditCard, QrCode } from "lucide-react-native";

interface LoyaltyCard {
  id: string;
  name: string;
  cardNumber: string;
  imageUrl?: string;
  barcode?: string;
}

interface LoyaltyCardTileProps {
  card: LoyaltyCard;
  onEdit: () => void;
  onDelete: () => void;
}

export default function LoyaltyCardTile({
  card,
  onEdit,
  onDelete,
}: LoyaltyCardTileProps) {
  return (
    <View className="w-[48%] bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-3 mb-3 mr-2">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{card.name}</Text>
          <Text className="text-white/80 text-xs mt-1">
            **** **** **** {card.cardNumber.slice(-4)}
          </Text>
        </View>

        {card.imageUrl ? (
          <Image
            source={card.imageUrl}
            className="w-8 h-8 rounded"
            contentFit="cover"
          />
        ) : (
          <View className="w-8 h-8 bg-white/20 rounded items-center justify-center">
            <CreditCard size={16} color="white" />
          </View>
        )}
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          {card.barcode && (
            <View className="bg-white/20 rounded-full w-6 h-6 items-center justify-center mr-2">
              <QrCode size={12} color="white" />
            </View>
          )}
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={onEdit}
            className="bg-white/20 rounded-full w-7 h-7 items-center justify-center"
          >
            <Edit3 size={12} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            className="bg-white/20 rounded-full w-7 h-7 items-center justify-center"
          >
            <Trash2 size={12} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
