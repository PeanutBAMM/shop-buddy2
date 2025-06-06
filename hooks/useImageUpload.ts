import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { uploadFile, UploadResult, generateUserFilePath } from "@/lib/storage";

interface UseImageUploadOptions {
  bucket: string;
  userId: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export function useImageUpload({
  bucket,
  userId,
  onSuccess,
  onError,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
}: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and photo library permissions are required to upload images.",
      );
      return false;
    }
    return true;
  };

  const processAndUploadImage = async (
    result: ImagePicker.ImagePickerResult,
  ): Promise<UploadResult | null> => {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    setUploading(true);

    try {
      // Generate unique file path
      const fileName = `image_${Date.now()}.jpg`;
      const filePath = generateUserFilePath(userId, fileName);

      // Convert to base64 for upload
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Upload to Supabase Storage
      const uploadResult = await uploadFile(bucket, filePath, base64, {
        contentType: "image/jpeg",
        upsert: true,
      });

      if (uploadResult.error) {
        throw uploadResult.error;
      }

      onSuccess?.(uploadResult);
      return uploadResult;
    } catch (error) {
      const errorObj = error as Error;
      onError?.(errorObj);
      return { data: null, error: errorObj };
    } finally {
      setUploading(false);
    }
  };

  const uploadFromCamera = async (): Promise<UploadResult | null> => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality,
        maxWidth,
        maxHeight,
      });

      return await processAndUploadImage(result);
    } catch (error) {
      const errorObj = error as Error;
      onError?.(errorObj);
      return { data: null, error: errorObj };
    }
  };

  const uploadFromGallery = async (): Promise<UploadResult | null> => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality,
        maxWidth,
        maxHeight,
      });

      return await processAndUploadImage(result);
    } catch (error) {
      const errorObj = error as Error;
      onError?.(errorObj);
      return { data: null, error: errorObj };
    }
  };

  return {
    uploading,
    uploadFromCamera,
    uploadFromGallery,
  };
}
