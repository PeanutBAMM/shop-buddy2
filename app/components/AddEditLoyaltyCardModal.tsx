import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { X, Save, Camera, CreditCard, QrCode } from "lucide-react-native";
import { Image } from "expo-image";
import { useImageUpload } from "@/hooks/useImageUpload";

interface LoyaltyCard {
  id: string;
  name: string;
  cardNumber: string;
  imageUrl?: string;
  barcode?: string;
}

interface AddEditLoyaltyCardModalProps {
  visible: boolean;
  card?: LoyaltyCard | null;
  userId: string;
  onSave: (card: Omit<LoyaltyCard, "id"> | LoyaltyCard) => void;
  onClose: () => void;
}

export default function AddEditLoyaltyCardModal({
  visible,
  card,
  userId,
  onSave,
  onClose,
}: AddEditLoyaltyCardModalProps) {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [barcode, setBarcode] = useState("");

  const { uploading, uploadFromCamera, uploadFromGallery } = useImageUpload({
    bucket: "loyalty-cards",
    userId: userId,
    onSuccess: (result) => {
      if (result.data?.publicUrl) {
        setImageUrl(result.data.publicUrl);
      }
    },
    onError: (error) => {
      Alert.alert("Upload Error", error.message);
    },
  });

  useEffect(() => {
    if (card) {
      setName(card.name);
      setCardNumber(card.cardNumber);
      setImageUrl(card.imageUrl);
      setBarcode(card.barcode || "");
    } else {
      setName("");
      setCardNumber("");
      setImageUrl(undefined);
      setBarcode("");
    }
  }, [card, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Fout", "Voer een winkelnaam in");
      return;
    }

    if (!cardNumber.trim()) {
      Alert.alert("Fout", "Voer een kaartnummer in");
      return;
    }

    const cardData = {
      name: name.trim(),
      cardNumber: cardNumber.trim(),
      imageUrl,
      barcode: barcode.trim() || undefined,
    };

    if (card) {
      onSave({ ...cardData, id: card.id });
    } else {
      onSave(cardData);
    }
  };

  const handleScanCard = () => {
    Alert.alert(
      "Kaart Scannen",
      "Kies een optie om je klantenkaart toe te voegen",
      [
        {
          text: "Camera",
          onPress: async () => {
            const result = await uploadFromCamera();
            if (result?.data?.publicUrl) {
              // Simulate AI recognition
              setTimeout(() => {
                Alert.alert(
                  "Kaart Herkend",
                  "We hebben je kaart gescand! Controleer de gegevens.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setName("Albert Heijn");
                        setCardNumber("1234567890123456");
                      },
                    },
                  ],
                );
              }, 1500);
            }
          },
        },
        {
          text: "Galerij",
          onPress: async () => {
            const result = await uploadFromGallery();
            if (result?.data?.publicUrl) {
              // Simulate AI recognition
              setTimeout(() => {
                Alert.alert(
                  "Kaart Herkend",
                  "We hebben je kaart gescand! Controleer de gegevens.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setName("Jumbo");
                        setCardNumber("9876543210987654");
                      },
                    },
                  ],
                );
              }, 1500);
            }
          },
        },
        { text: "Annuleren", style: "cancel" },
      ],
    );
  };

  const popularStores = [
    "Albert Heijn",
    "Jumbo",
    "Lidl",
    "PLUS",
    "Spar",
    "Coop",
    "Vomar",
    "Dirk",
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            {card ? "Kaart Bewerken" : "Kaart Toevoegen"}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            className="bg-purple-500 rounded-lg px-4 py-2"
          >
            <Text className="text-white font-medium">Opslaan</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Scan Option */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleScanCard}
              disabled={uploading}
              className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-4 flex-row items-center justify-center"
            >
              <Camera size={24} color="white" />
              <Text className="text-white font-semibold ml-2">
                {uploading ? "Uploading..." : "Kaart Scannen"}
              </Text>
            </TouchableOpacity>
            <Text className="text-sm text-gray-500 text-center mt-2">
              Scan je klantenkaart voor automatische herkenning
            </Text>
          </View>

          {/* Card Preview */}
          {imageUrl && (
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                Kaart Afbeelding
              </Text>
              <View className="bg-gray-100 rounded-lg p-4 items-center">
                <Image
                  source={imageUrl}
                  className="w-full h-32 rounded-lg"
                  contentFit="contain"
                />
              </View>
            </View>
          )}

          {/* Store Name */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Winkel Naam *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              value={name}
              onChangeText={setName}
              placeholder="Bijv. Albert Heijn"
            />
          </View>

          {/* Quick Store Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">
              Populaire winkels:
            </Text>
            <View className="flex-row flex-wrap">
              {popularStores.map((store) => (
                <TouchableOpacity
                  key={store}
                  onPress={() => setName(store)}
                  className="bg-gray-100 px-3 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-gray-700 text-sm">{store}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Card Number */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Kaartnummer *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="1234567890123456"
              keyboardType="numeric"
            />
          </View>

          {/* Barcode */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Barcode (optioneel)
            </Text>
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-base mr-3"
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Barcode nummer"
              />
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Barcode Scannen",
                    "Barcode scanner wordt geopend...",
                  )
                }
                className="bg-gray-100 rounded-lg p-3"
              >
                <QrCode size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Card Preview */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Voorbeeld
            </Text>
            <View className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-4">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    {name || "Winkel Naam"}
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    **** **** **** {cardNumber.slice(-4) || "****"}
                  </Text>
                </View>
                <View className="w-10 h-10 bg-white/20 rounded items-center justify-center">
                  <CreditCard size={20} color="white" />
                </View>
              </View>
              {barcode && (
                <View className="flex-row items-center">
                  <QrCode size={16} color="white" />
                  <Text className="text-white/80 text-xs ml-2">
                    Barcode beschikbaar
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
