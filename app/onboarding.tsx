import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Home,
  Briefcase,
  Users,
  ShoppingCart,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Bot,
  Heart,
  Dog,
  Cat,
  Fish,
  Bird,
  Rabbit,
  Edit3,
  Check,
  Star,
} from "lucide-react-native";
import { Image } from "expo-image";
import { supabase } from "@/lib/supabase";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  options?: { id: string; label: string; icon: any; color?: string }[];
  multiSelect?: boolean;
  allowCustom?: boolean;
  followUp?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "household_size",
    title: "Hoeveel mensen zitten er in je huishouden?",
    subtitle: "Dit helpt ons om betere portiegroottes voor te stellen.",
    options: [
      { id: "1", label: "1", icon: Users },
      { id: "2", label: "2", icon: Users },
      { id: "3", label: "3", icon: Users },
      { id: "4", label: "4", icon: Users },
      { id: "5+", label: "5+", icon: Users },
    ],
  },
  {
    id: "household_roles",
    title: "Wie maken deel uit van je huishouden?",
    subtitle: "Selecteer alle rollen die van toepassing zijn.",
    multiSelect: true,
    options: [
      { id: "papa", label: "Papa", icon: Users, color: "#3B82F6" },
      { id: "mama", label: "Mama", icon: Users, color: "#EC4899" },
      { id: "zoon", label: "Zoon", icon: Users, color: "#10B981" },
      { id: "dochter", label: "Dochter", icon: Users, color: "#F59E0B" },
      { id: "baby", label: "Baby", icon: Heart, color: "#EF4444" },
      { id: "andere", label: "Andere...", icon: Users, color: "#6B7280" },
    ],
    allowCustom: true,
  },
  {
    id: "pets",
    title: "Heb je huisdieren?",
    subtitle: "We kunnen dan ook dierenvoeding suggereren.",
    options: [
      { id: "ja", label: "Ja", icon: Heart, color: "#10B981" },
      { id: "nee", label: "Nee", icon: X, color: "#6B7280" },
    ],
  },
  {
    id: "pet_types",
    title: "Welke huisdieren heb je?",
    subtitle: "Selecteer alle huisdieren die je hebt.",
    multiSelect: true,
    options: [
      { id: "hond", label: "Hond", icon: Dog, color: "#8B5CF6" },
      { id: "kat", label: "Kat", icon: Cat, color: "#F59E0B" },
      { id: "konijn", label: "Konijn", icon: Rabbit, color: "#10B981" },
      { id: "vis", label: "Vis", icon: Fish, color: "#3B82F6" },
      { id: "vogel", label: "Vogel", icon: Bird, color: "#EF4444" },
      { id: "andere", label: "Andere...", icon: Heart, color: "#6B7280" },
    ],
    allowCustom: true,
  },
  {
    id: "shopping_frequency",
    title: "Hoe vaak ga je boodschappen doen?",
    subtitle: "We kunnen je helpen met planning en suggesties.",
    options: [
      { id: "daily", label: "Dagelijks", icon: ShoppingCart, color: "#10B981" },
      {
        id: "weekly",
        label: "Wekelijks",
        icon: ShoppingCart,
        color: "#3B82F6",
      },
      {
        id: "monthly",
        label: "Maandelijks",
        icon: ShoppingCart,
        color: "#F59E0B",
      },
    ],
  },
  {
    id: "favorite_stores",
    title: "Waar shop je meestal?",
    subtitle: "Dit helpt ons om betere suggesties te doen.",
    multiSelect: true,
    options: [
      {
        id: "albert_heijn",
        label: "Albert Heijn",
        icon: ShoppingCart,
        color: "#0066CC",
      },
      { id: "jumbo", label: "Jumbo", icon: ShoppingCart, color: "#FFD700" },
      { id: "lidl", label: "Lidl", icon: ShoppingCart, color: "#0050AA" },
      { id: "plus", label: "PLUS", icon: ShoppingCart, color: "#E31E24" },
      { id: "aldi", label: "Aldi", icon: ShoppingCart, color: "#FF6600" },
      {
        id: "andere",
        label: "Andere...",
        icon: ShoppingCart,
        color: "#6B7280",
      },
    ],
    allowCustom: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(true);
  const [videoSkippable, setVideoSkippable] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<
    Record<string, string | string[]>
  >({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<string | null>(null);
  const [customInputValue, setCustomInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      type: "bot" | "user";
      content: string;
      timestamp: Date;
    }>
  >([]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const skipButtonAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Video timer for skip button
  useEffect(() => {
    if (showVideo) {
      const timer = setTimeout(() => {
        setVideoSkippable(true);
        Animated.timing(skipButtonAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 3000);

      // Auto-transition after 15 seconds
      const autoTransition = setTimeout(() => {
        handleSkipVideo();
      }, 15000);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoTransition);
      };
    }
  }, [showVideo]);

  // Progress animation
  useEffect(() => {
    if (!showVideo) {
      Animated.timing(progressAnim, {
        toValue: (currentStep + 1) / onboardingSteps.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentStep, showVideo]);

  // Chat slide animation
  useEffect(() => {
    if (!showVideo) {
      Animated.timing(slideAnim, {
        toValue: -currentStep * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, showVideo]);

  const handleSkipVideo = () => {
    setShowVideo(false);
    // Add initial bot message
    setChatMessages([
      {
        id: "1",
        type: "bot",
        content:
          "Hallo! Ik ben je persoonlijke boodschappen-assistent. Laten we je profiel instellen zodat ik je beter kan helpen! 🛒✨",
        timestamp: new Date(),
      },
    ]);
  };

  const handleNext = () => {
    const step = onboardingSteps[currentStep];
    console.log(
      "handleNext called, currentStep:",
      currentStep,
      "step:",
      step?.id,
    );

    // Add user response to chat
    const userResponse = generateUserResponse(step);
    if (userResponse) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "user",
          content: userResponse,
          timestamp: new Date(),
        },
      ]);
    }

    if (currentStep < onboardingSteps.length - 1) {
      console.log("Moving to next step...");
      // Check if we should skip pet_types step
      if (step.id === "pets" && selections["pets"] === "nee") {
        setCurrentStep(currentStep + 2); // Skip pet_types
      } else {
        setCurrentStep(currentStep + 1);
      }

      // Add next bot message
      setTimeout(() => {
        const nextStep = onboardingSteps[currentStep + 1];
        if (
          nextStep &&
          !(
            step.id === "pets" &&
            selections["pets"] === "nee" &&
            nextStep.id === "pet_types"
          )
        ) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              type: "bot",
              content:
                getNextStepIndex() < onboardingSteps.length
                  ? onboardingSteps[getNextStepIndex()].title
                  : "",
              timestamp: new Date(),
            },
          ]);
        }
      }, 500);
    } else {
      console.log("Final step reached, completing onboarding...");
      completeOnboarding();
    }
  };

  const getNextStepIndex = () => {
    const step = onboardingSteps[currentStep];
    if (step.id === "pets" && selections["pets"] === "nee") {
      return currentStep + 2;
    }
    return currentStep + 1;
  };

  const generateUserResponse = (step: OnboardingStep): string => {
    const selection = selections[step.id];
    if (!selection) return "";

    switch (step.id) {
      case "household_size":
        return `We zijn met ${selection} personen.`;
      case "household_roles":
        if (Array.isArray(selection)) {
          const roles = selection
            .map((role) => {
              const custom = customInputs[`${step.id}_${role}`];
              return custom || role;
            })
            .join(", ");
          return `Ons huishouden bestaat uit: ${roles}.`;
        }
        return "";
      case "pets":
        return selection === "ja"
          ? "Ja, we hebben huisdieren!"
          : "Nee, we hebben geen huisdieren.";
      case "pet_types":
        if (Array.isArray(selection)) {
          const pets = selection
            .map((pet) => {
              const custom = customInputs[`${step.id}_${pet}`];
              return custom || pet;
            })
            .join(", ");
          return `We hebben: ${pets}.`;
        }
        return "";
      case "shopping_frequency":
        const frequency =
          selection === "daily"
            ? "dagelijks"
            : selection === "weekly"
              ? "wekelijks"
              : "maandelijks";
        return `Ik ga ${frequency} boodschappen doen.`;
      case "favorite_stores":
        if (Array.isArray(selection)) {
          const stores = selection
            .map((store) => {
              const custom = customInputs[`${step.id}_${store}`];
              return custom || store.replace("_", " ");
            })
            .join(", ");
          return `Ik shop meestal bij: ${stores}.`;
        }
        return "";
      default:
        return "";
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Check if we came from pets step and skipped pet_types
      const prevStep = onboardingSteps[currentStep - 1];
      if (
        prevStep &&
        prevStep.id === "pet_types" &&
        selections["pets"] === "nee"
      ) {
        setCurrentStep(currentStep - 2); // Go back to pets step
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleOptionSelect = (
    stepId: string,
    optionId: string,
    multiSelect = false,
  ) => {
    if (multiSelect) {
      const currentSelections = (selections[stepId] as string[]) || [];
      const newSelections = currentSelections.includes(optionId)
        ? currentSelections.filter((id) => id !== optionId)
        : [...currentSelections, optionId];
      setSelections({ ...selections, [stepId]: newSelections });
    } else {
      setSelections({ ...selections, [stepId]: optionId });
    }

    // Handle custom input
    if (optionId === "andere") {
      setShowCustomInput(`${stepId}_${optionId}`);
      setCustomInputValue("");
    }
  };

  const handleCustomInputSave = () => {
    if (showCustomInput && customInputValue.trim()) {
      setCustomInputs({
        ...customInputs,
        [showCustomInput]: customInputValue.trim(),
      });
    }
    setShowCustomInput(null);
    setCustomInputValue("");
  };

  const completeOnboarding = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        router.replace("/auth");
        return;
      }

      // Prepare preferences data
      const preferences = {
        household_size: selections.household_size,
        household_roles: selections.household_roles,
        pets: selections.pets,
        pet_types: selections.pet_types,
        shopping_frequency: selections.shopping_frequency,
        favorite_stores: selections.favorite_stores,
        custom_inputs: customInputs,
        completed_at: new Date().toISOString(),
      };

      // Simple insert or update approach
      const { error: insertError } = await supabase
        .from("users_metadata")
        .insert({
          user_id: session.user.id,
          email: session.user.email || "",
          registration_source: "Email",
          onboarding_status: true,
          preferences_json: preferences,
        });

      // If insert fails due to existing record, update it
      if (insertError && insertError.code === "23505") {
        const { error: updateError } = await supabase
          .from("users_metadata")
          .update({
            onboarding_status: true,
            preferences_json: preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", session.user.id);

        if (updateError) {
          throw updateError;
        }
      } else if (insertError) {
        throw insertError;
      }

      // Create additional data synchronously to avoid premature close
      try {
        await createHouseholdMembersInBackground(session.user.id);
        await createInitialShoppingListInBackground(session.user.id);
      } catch (error) {
        console.error("Background operations error:", error);
        // Continue to home even if background operations fail
      }

      // Navigate to home page
      setLoading(false);
      router.replace("/");
    } catch (error) {
      console.error("Onboarding error:", error);
      setLoading(false);

      // Still navigate to home on error to prevent getting stuck
      router.replace("/");
    }
  };

  const canProceed = () => {
    const step = onboardingSteps[currentStep];
    if (!step) return false;

    const selection = selections[step.id];
    if (step.multiSelect) {
      return Array.isArray(selection) && selection.length > 0;
    }
    return selection !== undefined;
  };

  const getCurrentStep = () => {
    // Skip pet_types if user said no to pets
    if (currentStep >= 3 && selections["pets"] === "nee") {
      return (
        onboardingSteps.filter((step) => step.id !== "pet_types")[
          currentStep - 1
        ] || onboardingSteps[currentStep]
      );
    }
    return onboardingSteps[currentStep];
  };

  const getVisibleSteps = () => {
    return onboardingSteps.filter((step) => {
      if (step.id === "pet_types" && selections["pets"] === "nee") {
        return false;
      }
      return true;
    });
  };

  const createHouseholdMembersInBackground = async (userId: string) => {
    try {
      const membersToCreate = [];

      // Create household members from household_roles
      if (
        selections.household_roles &&
        Array.isArray(selections.household_roles)
      ) {
        for (const role of selections.household_roles) {
          const customName = customInputs[`household_roles_${role}`];
          const memberName = customName || role;

          let avatarType: "default" | "baby" | "child" | "pet" | "custom" =
            "default";
          let avatarSeed = memberName;

          if (role === "baby" || memberName.toLowerCase().includes("baby")) {
            avatarType = "baby";
            avatarSeed = `Baby${memberName}`;
          } else if (
            role === "zoon" ||
            role === "dochter" ||
            memberName.toLowerCase().includes("kind")
          ) {
            avatarType = "child";
            avatarSeed = `Kind${memberName}`;
          }

          const memberData = {
            user_id: userId,
            name: memberName,
            type: "person" as const,
            avatar_type: avatarType,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`,
            relationship: role === "andere" ? customName : role,
            age: null,
          };

          membersToCreate.push(memberData);
        }
      }

      // Create pets from pet_types
      if (
        selections.pets === "ja" &&
        selections.pet_types &&
        Array.isArray(selections.pet_types)
      ) {
        for (const petType of selections.pet_types) {
          const customName = customInputs[`pet_types_${petType}`];
          const petName = customName || `Mijn ${petType}`;

          const petData = {
            user_id: userId,
            name: petName,
            type: "pet" as const,
            avatar_type: "pet" as const,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`Pet${petName}`)}&accessories=prescription02&clothingGraphic=bear`,
            relationship: petType === "andere" ? customName : petType,
            age: null,
          };

          membersToCreate.push(petData);
        }
      }

      // Insert household members with proper error handling
      if (membersToCreate.length > 0) {
        const { error: membersError } = await supabase
          .from("household_members")
          .insert(membersToCreate);

        if (membersError) {
          console.error("Error creating household members:", membersError);
        }
      }
    } catch (error) {
      console.error("Error creating household members:", error);
      throw error;
    }
  };

  const createInitialShoppingListInBackground = async (userId: string) => {
    try {
      const { error } = await supabase.from("shopping_lists").insert({
        user_id: userId,
        name: "Mijn eerste lijst",
        shared: false,
      });

      if (error) {
        console.error("Error creating shopping list:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error creating shopping list:", error);
      throw error;
    }
  };

  // Video Phase
  if (showVideo) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar style="light" />

        {/* Video Container */}
        <View className="flex-1 relative">
          <Image
            source="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
            className="w-full h-full"
            contentFit="cover"
          />

          {/* Video Overlay */}
          <View className="absolute inset-0 bg-black/40 items-center justify-center">
            <View className="bg-white/10 rounded-full w-20 h-20 items-center justify-center mb-8">
              <Play size={32} color="white" />
            </View>

            <Text className="text-white text-3xl font-bold text-center mb-4 px-6">
              Welkom bij je Slimme Boodschappenlijst!
            </Text>

            <Text className="text-white/90 text-lg text-center px-8 mb-8">
              Ontdek hoe AI je helpt bij slimmer boodschappen doen
            </Text>

            {/* Video Progress Bar */}
            <View className="w-64 h-1 bg-white/30 rounded-full mb-4">
              <Animated.View
                className="h-full bg-white rounded-full"
                style={{
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            </View>
          </View>

          {/* Skip Button */}
          {videoSkippable && (
            <Animated.View
              style={{
                position: "absolute",
                top: 60,
                right: 20,
                opacity: skipButtonAnim,
                transform: [
                  {
                    scale: skipButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                onPress={handleSkipVideo}
                className="bg-black/50 rounded-full w-12 h-12 items-center justify-center"
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Chat Phase
  const visibleSteps = getVisibleSteps();
  const step = getCurrentStep();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header with Progress */}
      <View className="pt-16 px-6 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center mb-4">
          <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center mr-3">
            <Bot size={24} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              Shop Buddy
            </Text>
            <Text className="text-sm text-gray-500">
              Je persoonlijke assistent
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="bg-gray-200 rounded-full h-2 mb-2">
          <Animated.View
            className="bg-blue-500 h-2 rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>
        <Text className="text-center text-gray-500 text-sm">
          Stap {currentStep + 1} van {visibleSteps.length}
        </Text>
      </View>

      {/* Chat Messages */}
      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map((message) => (
          <View
            key={message.id}
            className={`flex-row mb-4 ${
              message.type === "bot" ? "justify-start" : "justify-end"
            }`}
          >
            {message.type === "bot" && (
              <View className="bg-blue-100 rounded-full w-8 h-8 items-center justify-center mr-2 mt-1">
                <Bot size={16} color="#3B82F6" />
              </View>
            )}
            <View
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.type === "bot"
                  ? "bg-gray-100 rounded-bl-sm"
                  : "bg-blue-500 rounded-br-sm"
              }`}
            >
              <Text
                className={`text-base ${
                  message.type === "bot" ? "text-gray-800" : "text-white"
                }`}
              >
                {message.content}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Current Question */}
      <View className="px-4 py-4 bg-gray-50 border-t border-gray-100">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          {step.title}
        </Text>
        <Text className="text-gray-600 mb-4">{step.subtitle}</Text>

        {/* Options */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {step.options?.map((option) => {
            const IconComponent = option.icon;
            const isSelected = step.multiSelect
              ? (selections[step.id] as string[])?.includes(option.id)
              : selections[step.id] === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                onPress={() =>
                  handleOptionSelect(step.id, option.id, step.multiSelect)
                }
                className={`flex-row items-center px-4 py-3 rounded-xl border-2 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <IconComponent
                  size={20}
                  color={isSelected ? "#3B82F6" : option.color || "#6B7280"}
                />
                <Text
                  className={`ml-2 font-medium ${
                    isSelected ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
                {isSelected && (
                  <CheckCircle size={16} color="#3B82F6" className="ml-2" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Items Preview */}
        {step.multiSelect &&
          Array.isArray(selections[step.id]) &&
          (selections[step.id] as string[]).length > 0 && (
            <View className="bg-blue-50 rounded-lg p-3 mb-4">
              <Text className="text-blue-800 font-medium mb-1">
                Geselecteerd:
              </Text>
              <Text className="text-blue-700">
                {(selections[step.id] as string[])
                  .map((id) => {
                    const option = step.options?.find((opt) => opt.id === id);
                    const custom = customInputs[`${step.id}_${id}`];
                    return custom || option?.label || id;
                  })
                  .join(", ")}
              </Text>
            </View>
          )}
      </View>

      {/* Navigation Buttons */}
      <View className="border-t border-gray-200 bg-white">
        <View className="flex-row justify-between items-center p-4 pb-8">
          <TouchableOpacity
            onPress={handleBack}
            disabled={currentStep === 0}
            className={`flex-row items-center px-6 py-3 rounded-xl ${
              currentStep === 0 ? "bg-gray-100" : "bg-gray-200"
            }`}
          >
            <ArrowLeft
              size={20}
              color={currentStep === 0 ? "#D1D5DB" : "#6B7280"}
            />
            <Text
              className={`ml-2 font-medium ${
                currentStep === 0 ? "text-gray-400" : "text-gray-700"
              }`}
            >
              Terug
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (loading) return;

              if (currentStep === visibleSteps.length - 1) {
                completeOnboarding();
              } else {
                handleNext();
              }
            }}
            disabled={!canProceed() || loading}
            className={`flex-row items-center px-6 py-3 rounded-xl ${
              canProceed() && !loading ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <Text
              className={`font-medium mr-2 ${
                canProceed() && !loading ? "text-white" : "text-gray-500"
              }`}
            >
              {currentStep === visibleSteps.length - 1
                ? loading
                  ? "Bezig..."
                  : "Voltooien"
                : "Volgende"}
            </Text>
            {loading && currentStep === visibleSteps.length - 1 ? (
              <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : currentStep === visibleSteps.length - 1 ? (
              <Check
                size={20}
                color={canProceed() && !loading ? "white" : "#6B7280"}
              />
            ) : (
              <ArrowRight
                size={20}
                color={canProceed() && !loading ? "white" : "#6B7280"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Input Modal */}
      <Modal
        visible={showCustomInput !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomInput(null)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Voeg je eigen optie toe
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base mb-4"
              placeholder="Typ hier..."
              value={customInputValue}
              onChangeText={setCustomInputValue}
              autoFocus
            />
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setShowCustomInput(null)}
                className="px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-600 font-medium">Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCustomInputSave}
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Toevoegen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
