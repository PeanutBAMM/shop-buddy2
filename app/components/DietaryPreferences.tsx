import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Plus, X, Check } from "lucide-react-native";

interface DietaryPreference {
  id: string;
  name: string;
  selected: boolean;
}

export default function DietaryPreferences() {
  const [preferences, setPreferences] = useState<DietaryPreference[]>([
    { id: "1", name: "Vegetarisch", selected: false },
    { id: "2", name: "Veganistisch", selected: false },
    { id: "3", name: "Glutenvrij", selected: true },
    { id: "4", name: "Lactosevrij", selected: false },
    { id: "5", name: "Suikervrij", selected: false },
    { id: "6", name: "Keto", selected: false },
    { id: "7", name: "Paleo", selected: false },
    { id: "8", name: "Halal", selected: false },
    { id: "9", name: "Kosher", selected: false },
  ]);

  const [allergies, setAllergies] = useState<string[]>([
    "Noten",
    "Schaaldieren",
  ]);

  const [newAllergy, setNewAllergy] = useState("");

  const togglePreference = (id: string) => {
    setPreferences(
      preferences.map((pref) =>
        pref.id === id ? { ...pref, selected: !pref.selected } : pref,
      ),
    );
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const commonAllergies = [
    "Noten",
    "Pinda's",
    "Melk",
    "Eieren",
    "Soja",
    "Gluten",
    "Vis",
    "Schaaldieren",
    "Sesam",
    "Mosterd",
  ];

  return (
    <View>
      {/* Dietary Preferences */}
      <View className="mb-6">
        <Text className="text-base font-medium text-gray-700 mb-3">
          Dieetvoorkeuren
        </Text>
        <View className="flex-row flex-wrap">
          {preferences.map((preference) => (
            <TouchableOpacity
              key={preference.id}
              onPress={() => togglePreference(preference.id)}
              className={`flex-row items-center mr-3 mb-3 px-3 py-2 rounded-full border ${
                preference.selected
                  ? "bg-green-50 border-green-500"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              <View
                className={`w-4 h-4 rounded-full mr-2 items-center justify-center ${
                  preference.selected ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                {preference.selected && <Check size={10} color="white" />}
              </View>
              <Text
                className={`text-sm ${
                  preference.selected ? "text-green-700" : "text-gray-700"
                }`}
              >
                {preference.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Allergies */}
      <View>
        <Text className="text-base font-medium text-gray-700 mb-3">
          Allergieën & Intoleranties
        </Text>

        {/* Current Allergies */}
        <View className="flex-row flex-wrap mb-3">
          {allergies.map((allergy) => (
            <View
              key={allergy}
              className="flex-row items-center bg-red-50 border border-red-200 rounded-full px-3 py-2 mr-2 mb-2"
            >
              <Text className="text-red-700 text-sm mr-2">{allergy}</Text>
              <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                <X size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add New Allergy */}
        <View className="flex-row items-center mb-3">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base mr-3"
            value={newAllergy}
            onChangeText={setNewAllergy}
            placeholder="Voeg allergie toe..."
            onSubmitEditing={addAllergy}
          />
          <TouchableOpacity
            onPress={addAllergy}
            className="bg-red-500 rounded-full w-10 h-10 items-center justify-center"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Common Allergies */}
        <View>
          <Text className="text-sm font-medium text-gray-600 mb-2">
            Veelvoorkomende allergieën:
          </Text>
          <View className="flex-row flex-wrap">
            {commonAllergies
              .filter((allergy) => !allergies.includes(allergy))
              .map((allergy) => (
                <TouchableOpacity
                  key={allergy}
                  onPress={() => {
                    setAllergies([...allergies, allergy]);
                  }}
                  className="bg-gray-100 px-3 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-gray-700 text-sm">{allergy}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>
    </View>
  );
}
