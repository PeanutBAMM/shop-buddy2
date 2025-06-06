import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Camera, Image as ImageIcon, Upload } from "lucide-react-native";
import { Image } from "expo-image";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploaderProps {
  bucket: string;
  userId: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  placeholder?: string;
  aspectRatio?: [number, number];
  maxWidth?: number;
  maxHeight?: number;
}

export default function ImageUploader({
  bucket,
  userId,
  currentImageUrl,
  onImageUploaded,
  placeholder = "Geen afbeelding geselecteerd",
  aspectRatio = [1, 1],
  maxWidth = 800,
  maxHeight = 800,
}: ImageUploaderProps) {
  const { uploading, uploadFromCamera, uploadFromGallery } = useImageUpload({
    bucket,
    userId,
    maxWidth,
    maxHeight,
    onSuccess: (result) => {
      if (result.data?.publicUrl) {
        onImageUploaded(result.data.publicUrl);
      }
    },
    onError: (error) => {
      Alert.alert("Upload Error", error.message);
    },
  });

  const handleImageUpload = () => {
    Alert.alert(
      "Afbeelding selecteren",
      "Kies een optie om een afbeelding toe te voegen",
      [
        {
          text: "Camera",
          onPress: uploadFromCamera,
        },
        {
          text: "Galerij",
          onPress: uploadFromGallery,
        },
        { text: "Annuleren", style: "cancel" },
      ],
    );
  };

  return (
    <View className="items-center">
      {/* Image Preview */}
      <TouchableOpacity
        onPress={handleImageUpload}
        disabled={uploading}
        className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center mb-3"
      >
        {currentImageUrl ? (
          <Image
            source={currentImageUrl}
            className="w-full h-full rounded-lg"
            contentFit="cover"
          />
        ) : (
          <View className="items-center">
            <ImageIcon size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2 text-center">
              {uploading ? "Uploading..." : placeholder}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Upload Button */}
      <TouchableOpacity
        onPress={handleImageUpload}
        disabled={uploading}
        className="bg-blue-500 rounded-lg px-4 py-2 flex-row items-center"
      >
        <Upload size={16} color="white" />
        <Text className="text-white font-medium ml-2">
          {uploading
            ? "Uploading..."
            : currentImageUrl
              ? "Wijzigen"
              : "Afbeelding toevoegen"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
