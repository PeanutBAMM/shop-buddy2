import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { Image } from "expo-image";
import { Camera, Plus } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type DefaultAvatar = Database["public"]["Tables"]["default_avatars"]["Row"];

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelectAvatar: (
    avatar: string,
    avatarType: "default" | "baby" | "child" | "pet" | "custom",
  ) => void;
  type?: "person" | "pet";
  onCreateAvatar?: () => void;
}

export default function AvatarPicker({
  selectedAvatar,
  onSelectAvatar,
  type = "person",
  onCreateAvatar,
}: AvatarPickerProps) {
  const [defaultAvatars, setDefaultAvatars] = useState<DefaultAvatar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDefaultAvatars();
  }, [type]);

  const fetchDefaultAvatars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("default_avatars")
        .select("*")
        .in(
          "avatar_type",
          type === "pet" ? ["pet"] : ["person", "baby", "child"],
        )
        .order("avatar_type", { ascending: true });

      if (error) throw error;
      setDefaultAvatars(data || []);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      // Fallback to hardcoded avatars
      setDefaultAvatars(getFallbackAvatars());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAvatars = (): DefaultAvatar[] => {
    if (type === "pet") {
      return [
        {
          id: "1",
          name: "Max",
          avatar_type: "pet",
          avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=PetMax",
          seed: "PetMax",
          created_at: "",
        },
        {
          id: "2",
          name: "Bella",
          avatar_type: "pet",
          avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=PetBella",
          seed: "PetBella",
          created_at: "",
        },
        {
          id: "3",
          name: "Charlie",
          avatar_type: "pet",
          avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=PetCharlie",
          seed: "PetCharlie",
          created_at: "",
        },
        {
          id: "4",
          name: "Luna",
          avatar_type: "pet",
          avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=PetLuna",
          seed: "PetLuna",
          created_at: "",
        },
      ];
    }
    return [
      {
        id: "1",
        name: "Felix",
        avatar_type: "person",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        seed: "Felix",
        created_at: "",
      },
      {
        id: "2",
        name: "Emma",
        avatar_type: "person",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        seed: "Emma",
        created_at: "",
      },
      {
        id: "3",
        name: "Baby Emma",
        avatar_type: "baby",
        avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=BabyEmma",
        seed: "BabyEmma",
        created_at: "",
      },
      {
        id: "4",
        name: "Kind Tim",
        avatar_type: "child",
        avatar_url: "https://api.dicebear.com/7.x/big-smile/svg?seed=KindTim",
        seed: "KindTim",
        created_at: "",
      },
    ];
  };

  const groupedAvatars = defaultAvatars.reduce(
    (acc, avatar) => {
      if (!acc[avatar.avatar_type]) {
        acc[avatar.avatar_type] = [];
      }
      acc[avatar.avatar_type].push(avatar);
      return acc;
    },
    {} as Record<string, DefaultAvatar[]>,
  );

  const getAvatarTypeLabel = (avatarType: string) => {
    switch (avatarType) {
      case "person":
        return "Volwassenen";
      case "baby":
        return "Baby's";
      case "child":
        return "Kinderen";
      case "pet":
        return "Huisdieren";
      default:
        return avatarType;
    }
  };

  const getAvatarTypeFromString = (
    avatarType: string,
  ): "default" | "baby" | "child" | "pet" | "custom" => {
    switch (avatarType) {
      case "baby":
        return "baby";
      case "child":
        return "child";
      case "pet":
        return "pet";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <View className="bg-white p-4">
        <Text className="text-gray-500 text-center">Avatars laden...</Text>
      </View>
    );
  }

  return (
    <View className="bg-white">
      {/* Create Avatar Button */}
      {onCreateAvatar && (
        <View className="px-4 py-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={onCreateAvatar}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 flex-row items-center justify-center"
          >
            <Camera size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              Eigen Avatar Maken
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-500 text-center mt-2">
            Gebruik je camera om een persoonlijke avatar te maken
          </Text>
        </View>
      )}

      {/* Avatar Groups */}
      {Object.entries(groupedAvatars).map(([avatarType, avatars]) => (
        <View key={avatarType} className="mb-4">
          <Text className="text-sm font-medium text-gray-700 px-4 mb-2">
            {getAvatarTypeLabel(avatarType)}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="py-2"
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {avatars.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                onPress={() =>
                  onSelectAvatar(
                    avatar.avatar_url,
                    getAvatarTypeFromString(avatar.avatar_type),
                  )
                }
                className={`mr-3 rounded-full p-1 ${
                  selectedAvatar === avatar.avatar_url
                    ? "border-2 border-blue-500 bg-blue-50"
                    : "border-2 border-transparent"
                }`}
              >
                <Image
                  source={avatar.avatar_url}
                  className="w-12 h-12 rounded-full"
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}
