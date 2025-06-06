import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Image } from "expo-image";
import { Edit3, Trash2, User, Heart, Baby } from "lucide-react-native";

interface HouseholdMember {
  id: string;
  name: string;
  avatar: string;
  type: "person" | "pet";
  avatar_type?: "default" | "baby" | "child" | "pet" | "custom";
  age?: number;
  relationship?: string;
}

interface HouseholdMemberTileProps {
  member: HouseholdMember;
  onEdit: () => void;
  onDelete: () => void;
  style?: any;
}

export default function HouseholdMemberTile({
  member,
  onEdit,
  onDelete,
  style,
}: HouseholdMemberTileProps) {
  const getTypeIcon = () => {
    if (member.type === "pet") {
      return <Heart size={10} color="#EF4444" />;
    }
    if (member.avatar_type === "baby") {
      return <Baby size={10} color="#F59E0B" />;
    }
    if (member.avatar_type === "child") {
      return <User size={10} color="#10B981" />;
    }
    return <User size={10} color="#3B82F6" />;
  };

  const getTypeColor = () => {
    if (member.type === "pet") return "bg-red-100";
    if (member.avatar_type === "baby") return "bg-yellow-100";
    if (member.avatar_type === "child") return "bg-green-100";
    return "bg-blue-100";
  };

  return (
    <Animated.View
      style={style}
      className="w-[48%] bg-white rounded-xl p-3 mb-3 border border-gray-100 shadow-sm"
    >
      <View className="items-center mb-2">
        <View className="relative">
          <Image
            source={member.avatar}
            className="w-14 h-14 rounded-full border-2 border-gray-100"
            contentFit="cover"
          />
          <View
            className={`absolute -bottom-1 -right-1 ${getTypeColor()} rounded-full p-1.5 border border-white`}
          >
            {getTypeIcon()}
          </View>
        </View>

        <Text
          className="text-sm font-semibold text-gray-800 mt-2 text-center"
          numberOfLines={1}
        >
          {member.name}
        </Text>

        {member.relationship && (
          <Text className="text-xs text-gray-600 text-center" numberOfLines={1}>
            {member.relationship}
          </Text>
        )}

        {member.age && (
          <Text className="text-xs text-gray-500 text-center">
            {member.age} jaar
          </Text>
        )}
      </View>

      <View className="flex-row justify-center space-x-3 mt-1">
        <TouchableOpacity
          onPress={onEdit}
          className="bg-blue-50 rounded-full w-8 h-8 items-center justify-center active:bg-blue-100"
          activeOpacity={0.7}
        >
          <Edit3 size={14} color="#3B82F6" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-50 rounded-full w-8 h-8 items-center justify-center active:bg-red-100"
          activeOpacity={0.7}
        >
          <Trash2 size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
