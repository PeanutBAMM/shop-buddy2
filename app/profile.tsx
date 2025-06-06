import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Users,
  Heart,
  CreditCard,
  Edit3,
  Plus,
  Save,
  X,
  Camera,
  Check,
} from "lucide-react-native";
import { Image } from "expo-image";
import AppLayout from "./components/AppLayout";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import HouseholdMemberTile from "./components/HouseholdMemberTile";
import LoyaltyCardTile from "./components/LoyaltyCardTile";
import AddEditHouseholdMemberModal from "@/app/components/AddEditHouseholdMemberModal";
import AddEditLoyaltyCardModal from "./components/AddEditLoyaltyCardModal";
import DietaryPreferences from "./components/DietaryPreferences";
import type { RealtimeChannel } from "@supabase/supabase-js";

type HouseholdMemberRow =
  Database["public"]["Tables"]["household_members"]["Row"];
type LoyaltyCardRow = Database["public"]["Tables"]["loyalty_cards"]["Row"];

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface HouseholdMember {
  id: string;
  name: string;
  avatar: string;
  type: "person" | "pet";
  avatar_type?: "default" | "baby" | "child" | "pet" | "custom";
  age?: number;
  relationship?: string;
}

interface LoyaltyCard {
  id: string;
  name: string;
  cardNumber: string;
  imageUrl?: string;
  barcode?: string;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => ({
    id: "",
    name: "",
    email: "",
  }));

  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(
    [],
  );
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(userProfile.name);
  const [editedEmail, setEditedEmail] = useState(userProfile.email);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [showLoyaltyCardModal, setShowLoyaltyCardModal] = useState(false);
  const [editingHouseholdMember, setEditingHouseholdMember] =
    useState<HouseholdMember | null>(null);
  const [editingLoyaltyCard, setEditingLoyaltyCard] =
    useState<LoyaltyCard | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Real-time subscription refs
  const householdMembersChannel = useRef<RealtimeChannel | null>(null);
  const loyaltyCardsChannel = useRef<RealtimeChannel | null>(null);
  const subscriptionsSetup = useRef(false);

  useEffect(() => {
    initializeProfile();
  }, []);

  useEffect(() => {
    if (userProfile.id && !subscriptionsSetup.current) {
      fetchHouseholdMembers();
      fetchLoyaltyCards();
      setupRealtimeSubscriptions();
      subscriptionsSetup.current = true;
    }

    // Cleanup subscriptions on unmount
    return () => {
      if (householdMembersChannel.current) {
        supabase.removeChannel(householdMembersChannel.current);
        householdMembersChannel.current = null;
      }
      if (loyaltyCardsChannel.current) {
        supabase.removeChannel(loyaltyCardsChannel.current);
        loyaltyCardsChannel.current = null;
      }
      subscriptionsSetup.current = false;
    };
  }, [userProfile.id]);

  const initializeProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user metadata
        const { data: metadata } = await supabase
          .from("users_metadata")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        setUserProfile({
          id: session.user.id,
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email || "",
        });
      }
    } catch (error) {
      console.error("Error initializing profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHouseholdMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("household_members")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const members: HouseholdMember[] = (data || []).map(
        (member: HouseholdMemberRow) => ({
          id: member.id,
          name: member.name,
          avatar:
            member.avatar_url ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Default",
          type: member.type,
          avatar_type: member.avatar_type,
          age: member.age || undefined,
          relationship: member.relationship || undefined,
        }),
      );

      setHouseholdMembers(members);
    } catch (error) {
      console.error("Error fetching household members:", error);
      Alert.alert("Fout", "Kon gezinsleden niet laden");
    }
  };

  const fetchLoyaltyCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("loyalty_cards")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const cards: LoyaltyCard[] = (data || []).map((card: LoyaltyCardRow) => ({
        id: card.id,
        name: card.name,
        cardNumber: card.card_number,
        imageUrl: card.image_url || undefined,
        barcode: card.barcode || undefined,
      }));

      setLoyaltyCards(cards);
    } catch (error) {
      console.error("Error fetching loyalty cards:", error);
      Alert.alert("Fout", "Kon klantenkaarten niet laden");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Clean up existing subscriptions first
    if (householdMembersChannel.current) {
      supabase.removeChannel(householdMembersChannel.current);
      householdMembersChannel.current = null;
    }
    if (loyaltyCardsChannel.current) {
      supabase.removeChannel(loyaltyCardsChannel.current);
      loyaltyCardsChannel.current = null;
    }

    // Subscribe to household_members changes with immediate updates
    householdMembersChannel.current = supabase
      .channel(`household_members_${userProfile.id}_${Date.now()}`, {
        config: {
          broadcast: { self: true },
          presence: { key: userProfile.id },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "household_members",
          filter: `user_id=eq.${userProfile.id}`,
        },
        (payload) => {
          console.log("Real-time household member change:", payload);
          handleHouseholdMemberRealtimeChange(payload);
        },
      )
      .subscribe((status) => {
        console.log("Household members subscription status:", status);
      });

    // Subscribe to loyalty_cards changes with immediate updates
    loyaltyCardsChannel.current = supabase
      .channel(`loyalty_cards_${userProfile.id}_${Date.now()}`, {
        config: {
          broadcast: { self: true },
          presence: { key: userProfile.id },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loyalty_cards",
          filter: `user_id=eq.${userProfile.id}`,
        },
        (payload) => {
          console.log("Real-time loyalty card change:", payload);
          handleLoyaltyCardRealtimeChange(payload);
        },
      )
      .subscribe((status) => {
        console.log("Loyalty cards subscription status:", status);
      });
  };

  const handleHouseholdMemberRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case "INSERT":
        if (newRecord) {
          const newMember: HouseholdMember = {
            id: newRecord.id,
            name: newRecord.name,
            avatar:
              newRecord.avatar_url ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=Default",
            type: newRecord.type,
            avatar_type: newRecord.avatar_type,
            age: newRecord.age || undefined,
            relationship: newRecord.relationship || undefined,
          };
          setHouseholdMembers((prev) => [...prev, newMember]);
        }
        break;
      case "UPDATE":
        if (newRecord) {
          const updatedMember: HouseholdMember = {
            id: newRecord.id,
            name: newRecord.name,
            avatar:
              newRecord.avatar_url ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=Default",
            type: newRecord.type,
            avatar_type: newRecord.avatar_type,
            age: newRecord.age || undefined,
            relationship: newRecord.relationship || undefined,
          };
          setHouseholdMembers((prev) =>
            prev.map((member) =>
              member.id === updatedMember.id ? updatedMember : member,
            ),
          );
        }
        break;
      case "DELETE":
        if (oldRecord) {
          setHouseholdMembers((prev) =>
            prev.filter((member) => member.id !== oldRecord.id),
          );
        }
        break;
    }
  };

  const handleLoyaltyCardRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case "INSERT":
        if (newRecord) {
          const newCard: LoyaltyCard = {
            id: newRecord.id,
            name: newRecord.name,
            cardNumber: newRecord.card_number,
            imageUrl: newRecord.image_url || undefined,
            barcode: newRecord.barcode || undefined,
          };
          setLoyaltyCards((prev) => [...prev, newCard]);
        }
        break;
      case "UPDATE":
        if (newRecord) {
          const updatedCard: LoyaltyCard = {
            id: newRecord.id,
            name: newRecord.name,
            cardNumber: newRecord.card_number,
            imageUrl: newRecord.image_url || undefined,
            barcode: newRecord.barcode || undefined,
          };
          setLoyaltyCards((prev) =>
            prev.map((card) =>
              card.id === updatedCard.id ? updatedCard : card,
            ),
          );
        }
        break;
      case "DELETE":
        if (oldRecord) {
          setLoyaltyCards((prev) =>
            prev.filter((card) => card.id !== oldRecord.id),
          );
        }
        break;
    }
  };

  const handleSaveProfile = () => {
    setUserProfile({
      ...userProfile,
      name: editedName,
      email: editedEmail,
    });
    setIsEditingProfile(false);
    showSuccessToast();
  };

  const showSuccessToast = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 2000);
  };

  const handleAddHouseholdMember = async (
    member: Omit<HouseholdMember, "id">,
  ) => {
    try {
      const { data, error } = await supabase
        .from("household_members")
        .insert({
          user_id: userProfile.id,
          name: member.name,
          type: member.type,
          avatar_type: member.avatar_type || "default",
          avatar_url: member.avatar,
          age: member.age || null,
          relationship: member.relationship || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Real-time subscription will handle the update
      setShowHouseholdModal(false);
      showSuccessToast();
    } catch (error) {
      console.error("Error adding household member:", error);
      Alert.alert("Fout", "Kon gezinslid niet toevoegen");
    }
  };

  const handleEditHouseholdMember = async (member: HouseholdMember) => {
    try {
      const { error } = await supabase
        .from("household_members")
        .update({
          name: member.name,
          type: member.type,
          avatar_type: member.avatar_type || "default",
          avatar_url: member.avatar,
          age: member.age || null,
          relationship: member.relationship || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", member.id);

      if (error) throw error;

      // Real-time subscription will handle the update
      setEditingHouseholdMember(null);
      setShowHouseholdModal(false);
      showSuccessToast();
    } catch (error) {
      console.error("Error updating household member:", error);
      Alert.alert("Fout", "Kon gezinslid niet bijwerken");
    }
  };

  const handleDeleteHouseholdMember = (id: string) => {
    Alert.alert(
      "Lid verwijderen",
      "Weet je zeker dat je dit gezinslid wilt verwijderen?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            try {
              // Immediately update UI for better UX
              const memberToDelete = householdMembers.find((m) => m.id === id);
              setHouseholdMembers((prev) => prev.filter((m) => m.id !== id));

              const { error } = await supabase
                .from("household_members")
                .delete()
                .eq("id", id);

              if (error) {
                // Restore member if delete failed
                if (memberToDelete) {
                  setHouseholdMembers((prev) => [...prev, memberToDelete]);
                }
                throw error;
              }

              showSuccessToast();
            } catch (error) {
              console.error("Error deleting household member:", error);
              Alert.alert("Fout", "Kon gezinslid niet verwijderen");
            }
          },
        },
      ],
    );
  };

  const handleAddLoyaltyCard = async (card: Omit<LoyaltyCard, "id">) => {
    try {
      const { data, error } = await supabase
        .from("loyalty_cards")
        .insert({
          user_id: userProfile.id,
          name: card.name,
          card_number: card.cardNumber,
          image_url: card.imageUrl || null,
          barcode: card.barcode || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Real-time subscription will handle the update
      setShowLoyaltyCardModal(false);
      showSuccessToast();
    } catch (error) {
      console.error("Error adding loyalty card:", error);
      Alert.alert("Fout", "Kon klantenkaart niet toevoegen");
    }
  };

  const handleEditLoyaltyCard = async (card: LoyaltyCard) => {
    try {
      const { error } = await supabase
        .from("loyalty_cards")
        .update({
          name: card.name,
          card_number: card.cardNumber,
          image_url: card.imageUrl || null,
          barcode: card.barcode || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", card.id);

      if (error) throw error;

      // Real-time subscription will handle the update
      setEditingLoyaltyCard(null);
      setShowLoyaltyCardModal(false);
      showSuccessToast();
    } catch (error) {
      console.error("Error updating loyalty card:", error);
      Alert.alert("Fout", "Kon klantenkaart niet bijwerken");
    }
  };

  const handleDeleteLoyaltyCard = (id: string) => {
    Alert.alert(
      "Kaart verwijderen",
      "Weet je zeker dat je deze klantenkaart wilt verwijderen?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("loyalty_cards")
                .delete()
                .eq("id", id);

              if (error) throw error;

              // Real-time subscription will handle the update
              showSuccessToast();
            } catch (error) {
              console.error("Error deleting loyalty card:", error);
              Alert.alert("Fout", "Kon klantenkaart niet verwijderen");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppLayout>
        <StatusBar style="auto" />
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="px-4 py-6 bg-white border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">
              Mijn Profiel
            </Text>
            <Text className="text-gray-600 mt-1">
              Welkom! Hier kun je je persoonlijke informatie en voorkeuren
              beheren
            </Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Personal Information Section */}
            <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                <View className="flex-row items-center">
                  <User size={20} color="#3B82F6" />
                  <Text className="text-lg font-semibold text-gray-800 ml-2">
                    Persoonlijke Informatie
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (isEditingProfile) {
                      handleSaveProfile();
                    } else {
                      setIsEditingProfile(true);
                      setEditedName(userProfile.name);
                      setEditedEmail(userProfile.email);
                    }
                  }}
                  className="p-2"
                >
                  {isEditingProfile ? (
                    <Save size={20} color="#10B981" />
                  ) : (
                    <Edit3 size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>

              <View className="p-4">
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Naam
                  </Text>
                  {isEditingProfile ? (
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Voer je naam in"
                    />
                  ) : (
                    <Text className="text-base text-gray-800">
                      {userProfile.name}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </Text>
                  {isEditingProfile ? (
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                      value={editedEmail}
                      onChangeText={setEditedEmail}
                      placeholder="Voer je e-mail in"
                      keyboardType="email-address"
                    />
                  ) : (
                    <Text className="text-base text-gray-800">
                      {userProfile.email}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Household Members Section */}
            <View className="bg-white mx-4 mt-4 rounded-xl border border-gray-100 shadow-sm">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                <View className="flex-row items-center">
                  <Users size={20} color="#10B981" />
                  <Text className="text-lg font-semibold text-gray-800 ml-2">
                    Gezinsleden & Huisdieren
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="px-4 pt-4 pb-2">
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={() => {
                      setEditingHouseholdMember(null);
                      setShowHouseholdModal(true);
                    }}
                    className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 flex-row items-center justify-center"
                  >
                    <Plus size={16} color="#3B82F6" />
                    <Text className="text-blue-600 font-medium ml-2">
                      Lid Toevoegen
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setEditingHouseholdMember(null);
                      setShowHouseholdModal(true);
                    }}
                    className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 flex-row items-center justify-center"
                  >
                    <Heart size={16} color="#10B981" />
                    <Text className="text-green-600 font-medium ml-2">
                      Huisdier
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="p-4 pt-2">
                <View className="flex-row flex-wrap">
                  {householdMembers.map((member, index) => {
                    return (
                      <HouseholdMemberTile
                        key={member.id}
                        member={{
                          ...member,
                          avatar: member.avatar,
                          avatar_type:
                            member.type === "pet"
                              ? "pet"
                              : member.avatar_type || "default",
                        }}
                        onEdit={() => {
                          setEditingHouseholdMember({
                            ...member,
                            avatar_type:
                              member.type === "pet"
                                ? "pet"
                                : member.avatar_type || "default",
                          });
                          setShowHouseholdModal(true);
                        }}
                        onDelete={() => handleDeleteHouseholdMember(member.id)}
                      />
                    );
                  })}
                </View>

                {householdMembers.length === 0 && !loading && (
                  <View className="items-center py-8">
                    <Users size={48} color="#D1D5DB" />
                    <Text className="text-gray-500 mt-2 text-center">
                      Nog geen gezinsleden toegevoegd
                    </Text>
                    <Text className="text-gray-400 text-sm text-center mt-1">
                      Voeg gezinsleden toe om gepersonaliseerde suggesties te
                      krijgen
                    </Text>
                  </View>
                )}

                {loading && (
                  <View className="items-center py-8">
                    <Text className="text-gray-500 mt-2 text-center">
                      Gezinsleden laden...
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Dietary Preferences Section */}
            <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200">
              <View className="flex-row items-center p-4 border-b border-gray-100">
                <Heart size={20} color="#EF4444" />
                <Text className="text-lg font-semibold text-gray-800 ml-2">
                  Dieetvoorkeuren & Allergieën
                </Text>
              </View>

              <View className="p-4">
                <DietaryPreferences />
              </View>
            </View>

            {/* Loyalty Cards Section */}
            <View className="bg-white mx-4 mt-4 mb-6 rounded-lg border border-gray-200">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                <View className="flex-row items-center">
                  <CreditCard size={20} color="#8B5CF6" />
                  <Text className="text-lg font-semibold text-gray-800 ml-2">
                    Klantenkaarten
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setEditingLoyaltyCard(null);
                    setShowLoyaltyCardModal(true);
                  }}
                  className="bg-purple-500 rounded-full w-8 h-8 items-center justify-center"
                >
                  <Plus size={16} color="white" />
                </TouchableOpacity>
              </View>

              <View className="p-4">
                <View className="flex-row flex-wrap">
                  {loyaltyCards.map((card) => (
                    <LoyaltyCardTile
                      key={card.id}
                      card={card}
                      onEdit={() => {
                        setEditingLoyaltyCard(card);
                        setShowLoyaltyCardModal(true);
                      }}
                      onDelete={() => handleDeleteLoyaltyCard(card.id)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Success Animation Overlay */}
          {showSuccessAnimation && (
            <View className="absolute inset-0 bg-black/20 items-center justify-center">
              <View className="bg-white rounded-full w-20 h-20 items-center justify-center">
                <Check size={40} color="#10B981" />
              </View>
            </View>
          )}

          {/* Modals */}
          <AddEditHouseholdMemberModal
            visible={showHouseholdModal}
            member={editingHouseholdMember}
            userId={userProfile.id}
            onSave={
              editingHouseholdMember
                ? handleEditHouseholdMember
                : handleAddHouseholdMember
            }
            onClose={() => {
              setShowHouseholdModal(false);
              setEditingHouseholdMember(null);
            }}
          />

          <AddEditLoyaltyCardModal
            visible={showLoyaltyCardModal}
            card={editingLoyaltyCard}
            userId={userProfile.id}
            onSave={
              editingLoyaltyCard ? handleEditLoyaltyCard : handleAddLoyaltyCard
            }
            onClose={() => {
              setShowLoyaltyCardModal(false);
              setEditingLoyaltyCard(null);
            }}
          />
        </View>
      </AppLayout>
    </SafeAreaView>
  );
}
