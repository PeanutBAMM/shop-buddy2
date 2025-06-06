import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Users,
  MapPin,
  Bell,
  Bot,
  Shield,
  HelpCircle,
  ChevronRight,
  Smartphone,
  Globe,
} from "lucide-react-native";
import AppLayout from "./components/AppLayout";
import { supabase } from "@/lib/supabase";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: "navigation" | "toggle" | "info";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [locationServices, setLocationServices] = useState(false);
  const [familySharing, setFamilySharing] = useState(true);

  const settingSections = [
    {
      title: "Account",
      items: [
        {
          id: "profile",
          title: "Profiel",
          subtitle: "Persoonlijke informatie",
          icon: User,
          type: "navigation" as const,
          onPress: () =>
            Alert.alert("Profiel", "Profiel instellingen worden geopend..."),
        },
        {
          id: "family",
          title: "Gezinsleden",
          subtitle: "Beheer gedeelde toegang",
          icon: Users,
          type: "navigation" as const,
          onPress: () =>
            Alert.alert("Gezinsleden", "Gezinsleden beheer wordt geopend..."),
        },
      ],
    },
    {
      title: "AI & Personalisatie",
      items: [
        {
          id: "ai-suggestions",
          title: "AI Suggesties",
          subtitle: "Gepersonaliseerde aanbevelingen",
          icon: Bot,
          type: "toggle" as const,
          value: aiSuggestions,
          onToggle: setAiSuggestions,
        },
        {
          id: "ai-preferences",
          title: "AI Voorkeuren",
          subtitle: "Pas AI gedrag aan",
          icon: Bot,
          type: "navigation" as const,
          onPress: () =>
            Alert.alert("AI Voorkeuren", "AI voorkeuren worden geopend..."),
        },
      ],
    },
    {
      title: "Winkels & Locatie",
      items: [
        {
          id: "stores",
          title: "Winkel Layouts",
          subtitle: "Configureer winkel indelingen",
          icon: MapPin,
          type: "navigation" as const,
          onPress: () =>
            Alert.alert(
              "Winkel Layouts",
              "Winkel configuratie wordt geopend...",
            ),
        },
        {
          id: "location",
          title: "Locatieservices",
          subtitle: "Voor winkel suggesties",
          icon: Globe,
          type: "toggle" as const,
          value: locationServices,
          onToggle: setLocationServices,
        },
      ],
    },
    {
      title: "Meldingen",
      items: [
        {
          id: "notifications",
          title: "Push Meldingen",
          subtitle: "Algemene meldingen",
          icon: Bell,
          type: "toggle" as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: "notification-settings",
          title: "Melding Instellingen",
          subtitle: "Configureer alerts & herinneringen",
          icon: Smartphone,
          type: "navigation" as const,
          onPress: () =>
            Alert.alert("Meldingen", "Melding instellingen worden geopend..."),
        },
      ],
    },
    {
      title: "Privacy & Beveiliging",
      items: [
        {
          id: "family-sharing",
          title: "Gezin Delen",
          subtitle: "Realtime synchronisatie",
          icon: Users,
          type: "toggle" as const,
          value: familySharing,
          onToggle: setFamilySharing,
        },
        {
          id: "privacy",
          title: "Privacy Instellingen",
          subtitle: "Databeheer en privacy",
          icon: Shield,
          type: "navigation" as const,
          onPress: () =>
            Alert.alert("Privacy", "Privacy instellingen worden geopend..."),
        },
      ],
    },
    {
      title: "Ondersteuning",
      items: [
        {
          id: "help",
          title: "Help & Support",
          subtitle: "Veelgestelde vragen",
          icon: HelpCircle,
          type: "navigation" as const,
          onPress: () => Alert.alert("Help", "Help sectie wordt geopend..."),
        },
        {
          id: "version",
          title: "App Versie",
          subtitle: "v1.0.0",
          icon: Smartphone,
          type: "info" as const,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        key={item.id}
        className="flex-row items-center py-4 px-4 bg-white border-b border-gray-100"
        onPress={item.onPress}
        disabled={item.type === "info"}
      >
        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
          <IconComponent size={20} color="#6B7280" />
        </View>

        <View className="flex-1">
          <Text className="text-base font-medium text-gray-800">
            {item.title}
          </Text>
          {item.subtitle && (
            <Text className="text-sm text-gray-500 mt-1">{item.subtitle}</Text>
          )}
        </View>

        {item.type === "toggle" && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
            thumbColor={item.value ? "#FFFFFF" : "#FFFFFF"}
          />
        )}

        {item.type === "navigation" && (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
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
            <Text className="text-2xl font-bold text-gray-800">
              Instellingen
            </Text>
            <Text className="text-gray-600 mt-1">Pas je app ervaring aan</Text>
          </View>

          {/* Settings Sections */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {settingSections.map((section, sectionIndex) => (
              <View key={section.title} className="mt-6">
                <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">
                  {section.title}
                </Text>
                <View className="bg-white border-t border-b border-gray-200">
                  {section.items.map((item) => renderSettingItem(item))}
                </View>
              </View>
            ))}

            {/* Footer Space */}
            <View className="h-20" />
          </ScrollView>
        </View>
      </AppLayout>
    </SafeAreaView>
  );
}
