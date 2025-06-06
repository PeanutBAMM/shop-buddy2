import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { X, Save, User, Heart, Baby } from "lucide-react-native";
import AvatarPicker from "./AvatarPicker";
import CameraAvatarModal from "./CameraAvatarModal";

interface HouseholdMember {
  id: string;
  name: string;
  avatar: string;
  type: "person" | "pet";
  avatar_type?: "default" | "baby" | "child" | "pet" | "custom";
  age?: number;
  relationship?: string;
}

interface AddEditHouseholdMemberModalProps {
  visible: boolean;
  member?: HouseholdMember | null;
  userId: string;
  onSave: (member: Omit<HouseholdMember, "id"> | HouseholdMember) => void;
  onClose: () => void;
}

export default function AddEditHouseholdMemberModal({
  visible,
  member,
  userId,
  onSave,
  onClose,
}: AddEditHouseholdMemberModalProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Default",
  );
  const [type, setType] = useState<"person" | "pet">("person");
  const [avatarType, setAvatarType] = useState<
    "default" | "baby" | "child" | "pet" | "custom"
  >("default");
  const [age, setAge] = useState("");
  const [relationship, setRelationship] = useState("");
  const [showCameraModal, setShowCameraModal] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setAvatar(member.avatar);
      setType(member.type);
      setAvatarType(member.avatar_type || "default");
      setAge(member.age?.toString() || "");
      setRelationship(member.relationship || "");
    } else {
      setName("");
      setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=Default");
      setType("person");
      setAvatarType("default");
      setAge("");
      setRelationship("");
    }
  }, [member, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Fout", "Voer een naam in");
      return;
    }

    const memberData = {
      name: name.trim(),
      avatar,
      type,
      avatar_type: avatarType,
      age: age ? parseInt(age) : undefined,
      relationship: relationship.trim() || undefined,
    };

    if (member) {
      onSave({ ...memberData, id: member.id });
    } else {
      onSave(memberData);
    }
  };

  const handleAvatarSelect = (
    avatarUrl: string,
    selectedAvatarType: "default" | "baby" | "child" | "pet" | "custom",
  ) => {
    setAvatar(avatarUrl);
    setAvatarType(selectedAvatarType);
  };

  const handleCameraAvatarCreated = (avatarUrl: string) => {
    setAvatar(avatarUrl);
    setAvatarType("custom");
    setShowCameraModal(false);
  };

  const relationshipSuggestions =
    type === "person"
      ? ["Partner", "Kind", "Ouder", "Broer/Zus", "Opa/Oma", "Vriend/Vriendin"]
      : ["Hond", "Kat", "Vogel", "Vis", "Konijn", "Hamster"];

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <Animated.View
            style={{
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            }}
            className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-white"
          >
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              {member ? "Lid Bewerken" : "Lid Toevoegen"}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-500 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium">Opslaan</Text>
            </TouchableOpacity>
          </Animated.View>

          <ScrollView
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
          >
            {/* Type Selection */}
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              }}
              className="mb-6"
            >
              <Text className="text-base font-medium text-gray-700 mb-3">
                Type
              </Text>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => {
                    setType("person");
                    if (avatarType === "pet") {
                      setAvatarType("default");
                    }
                  }}
                  className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border-2 ${
                    type === "person"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <User
                    size={20}
                    color={type === "person" ? "#3B82F6" : "#6B7280"}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      type === "person" ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    Persoon
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setType("pet");
                    setAvatarType("pet");
                  }}
                  className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border-2 ${
                    type === "pet"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Heart
                    size={20}
                    color={type === "pet" ? "#EF4444" : "#6B7280"}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      type === "pet" ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    Huisdier
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Avatar Selection */}
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              }}
              className="mb-6"
            >
              <Text className="text-base font-medium text-gray-700 mb-3">
                Avatar
              </Text>
              <View className="bg-gray-50 rounded-xl border border-gray-200">
                <AvatarPicker
                  selectedAvatar={avatar}
                  onSelectAvatar={handleAvatarSelect}
                  type={type}
                  onCreateAvatar={() => setShowCameraModal(true)}
                />
              </View>
            </Animated.View>

            {/* Name Input */}
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              }}
              className="mb-4"
            >
              <Text className="text-base font-medium text-gray-700 mb-2">
                Naam *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                value={name}
                onChangeText={setName}
                placeholder={type === "person" ? "Bijv. Emma" : "Bijv. Max"}
              />
            </Animated.View>

            {/* Age Input */}
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              }}
              className="mb-4"
            >
              <Text className="text-base font-medium text-gray-700 mb-2">
                {type === "person" ? "Leeftijd" : "Leeftijd (jaren)"}
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                value={age}
                onChangeText={setAge}
                placeholder="Optioneel"
                keyboardType="numeric"
              />
            </Animated.View>

            {/* Relationship Input */}
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              }}
              className="mb-4"
            >
              <Text className="text-base font-medium text-gray-700 mb-2">
                {type === "person" ? "Relatie" : "Diersoort"}
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                value={relationship}
                onChangeText={setRelationship}
                placeholder={
                  type === "person" ? "Bijv. Partner, Kind" : "Bijv. Hond, Kat"
                }
              />
            </Animated.View>

            {/* Quick Suggestions */}
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              }}
              className="mb-6"
            >
              <Text className="text-sm font-medium text-gray-600 mb-2">
                Snelle keuzes:
              </Text>
              <View className="flex-row flex-wrap">
                {relationshipSuggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    onPress={() => setRelationship(suggestion)}
                    className="bg-gray-100 px-3 py-2 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-gray-700 text-sm">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </ScrollView>
        </View>
      </Modal>

      {/* Camera Avatar Modal */}
      <CameraAvatarModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onAvatarCreated={handleCameraAvatarCreated}
        userId={userId}
      />
    </>
  );
}
