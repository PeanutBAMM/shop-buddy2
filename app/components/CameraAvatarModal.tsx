import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, Alert } from "react-native";
import { X, Camera, Image as ImageIcon } from "lucide-react-native";
import { Image } from "expo-image";
import { useImageUpload } from "@/hooks/useImageUpload";
import { STORAGE_BUCKETS } from "@/lib/storage";

interface CameraAvatarModalProps {
  visible: boolean;
  onClose: () => void;
  onAvatarCreated: (avatarUrl: string) => void;
  userId: string;
}

export default function CameraAvatarModal({
  visible,
  onClose,
  onAvatarCreated,
  userId,
}: CameraAvatarModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { uploading, uploadFromCamera, uploadFromGallery } = useImageUpload({
    bucket: STORAGE_BUCKETS.USER_AVATARS,
    userId: userId,
    onSuccess: (result) => {
      if (result.data?.publicUrl) {
        setPreviewUrl(result.data.publicUrl);
      }
    },
    onError: (error) => {
      Alert.alert("Upload Error", error.message);
    },
  });

  const handleTakePhoto = async () => {
    try {
      const result = await uploadFromCamera();
      if (result?.data?.publicUrl) {
        setPreviewUrl(result.data.publicUrl);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await uploadFromGallery();
      if (result?.data?.publicUrl) {
        setPreviewUrl(result.data.publicUrl);
      }
    } catch (error) {
      console.error("Gallery error:", error);
    }
  };

  const handleSaveAvatar = () => {
    if (previewUrl) {
      onAvatarCreated(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={handleClose} className="p-2">
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Avatar Foto
          </Text>
          {previewUrl && (
            <TouchableOpacity
              onPress={handleSaveAvatar}
              className="bg-blue-500 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium">Opslaan</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-1 p-4">
          {/* Preview */}
          {previewUrl ? (
            <View className="items-center mb-6">
              <Image
                source={previewUrl}
                className="w-40 h-40 rounded-full border-4 border-blue-500"
                contentFit="cover"
              />
              <Text className="text-gray-600 mt-2">
                Voorbeeld van je avatar
              </Text>
            </View>
          ) : (
            <View className="items-center mb-6">
              <View className="w-40 h-40 rounded-full bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
                <Camera size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">
                  Geen foto geselecteerd
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="space-y-4">
            <TouchableOpacity
              onPress={handleTakePhoto}
              disabled={uploading}
              className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center"
            >
              <Camera size={24} color="white" />
              <Text className="text-white font-semibold ml-2">
                {uploading ? "Uploading..." : "Foto maken"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSelectFromGallery}
              disabled={uploading}
              className="bg-gray-500 rounded-lg p-4 flex-row items-center justify-center"
            >
              <ImageIcon size={24} color="white" />
              <Text className="text-white font-semibold ml-2">
                {uploading ? "Uploading..." : "Uit galerij kiezen"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View className="mt-6 p-4 bg-blue-50 rounded-lg">
            <Text className="text-blue-800 font-medium mb-2">
              Tips voor een goede avatar:
            </Text>
            <Text className="text-blue-700 text-sm">
              • Zorg voor goede belichting{"\n"}• Kijk recht in de camera{"\n"}•
              Houd je gezicht gecentreerd{"\n"}• Gebruik een neutrale
              achtergrond
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
