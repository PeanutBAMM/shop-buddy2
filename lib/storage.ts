import { supabase } from "./supabase";
import { decode } from "base64-arraybuffer";

export interface UploadResult {
  data: {
    path: string;
    fullPath: string;
    publicUrl?: string;
  } | null;
  error: Error | null;
}

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  RECIPE_IMAGES: "recipe-images",
  INVENTORY_PHOTOS: "inventory-photos",
  RECEIPT_SCANS: "receipt-scans",
  USER_AVATARS: "user-avatars",
  LOYALTY_CARDS: "loyalty-cards",
} as const;

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The path where the file will be stored (should include user ID as folder)
 * @param file - The file to upload (File object or base64 string)
 * @param options - Upload options
 */
export async function uploadFile(
  bucket: string,
  filePath: string,
  file: File | string,
  options: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  } = {},
): Promise<UploadResult> {
  try {
    let fileData: ArrayBuffer | File;
    let contentType = options.contentType;

    if (typeof file === "string") {
      // Handle base64 string
      fileData = decode(file);
      contentType = contentType || "image/jpeg";
    } else {
      // Handle File object
      fileData = file;
      contentType = contentType || file.type;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileData, {
        contentType,
        cacheControl: options.cacheControl || "3600",
        upsert: options.upsert || false,
      });

    if (error) {
      throw error;
    }

    // Get public URL if needed
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      data: {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: urlData.publicUrl,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

/**
 * Download a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The path of the file to download
 */
export async function downloadFile(bucket: string, filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get the public URL for a file
 * @param bucket - The storage bucket name
 * @param filePath - The path of the file
 */
export function getPublicUrl(bucket: string, filePath: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Get a signed URL for private file access
 * @param bucket - The storage bucket name
 * @param filePath - The path of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = 3600,
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * List files in a storage bucket folder
 * @param bucket - The storage bucket name
 * @param folder - The folder path (optional)
 * @param options - List options
 */
export async function listFiles(
  bucket: string,
  folder?: string,
  options: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: "asc" | "desc" };
  } = {},
) {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit: options.limit,
      offset: options.offset,
      sortBy: options.sortBy,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Delete a file from storage
 * @param bucket - The storage bucket name
 * @param filePaths - Array of file paths to delete
 */
export async function deleteFiles(bucket: string, filePaths: string[]) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Generate a user-specific file path
 * @param userId - The user ID
 * @param fileName - The file name
 * @param folder - Optional subfolder
 */
export function generateUserFilePath(
  userId: string,
  fileName: string,
  folder?: string,
): string {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueFileName = `${timestamp}_${cleanFileName}`;

  if (folder) {
    return `${userId}/${folder}/${uniqueFileName}`;
  }
  return `${userId}/${uniqueFileName}`;
}

/**
 * Helper functions for specific buckets
 */
export const recipeStorage = {
  upload: (userId: string, file: File | string, fileName: string) =>
    uploadFile(
      STORAGE_BUCKETS.RECIPE_IMAGES,
      generateUserFilePath(userId, fileName, "recipes"),
      file,
    ),
  getUrl: (filePath: string) =>
    getPublicUrl(STORAGE_BUCKETS.RECIPE_IMAGES, filePath),
  delete: (filePaths: string[]) =>
    deleteFiles(STORAGE_BUCKETS.RECIPE_IMAGES, filePaths),
  list: (userId: string) =>
    listFiles(STORAGE_BUCKETS.RECIPE_IMAGES, `${userId}/recipes`),
};

export const inventoryStorage = {
  upload: (userId: string, file: File | string, fileName: string) =>
    uploadFile(
      STORAGE_BUCKETS.INVENTORY_PHOTOS,
      generateUserFilePath(userId, fileName, "inventory"),
      file,
    ),
  getUrl: (filePath: string) =>
    getPublicUrl(STORAGE_BUCKETS.INVENTORY_PHOTOS, filePath),
  delete: (filePaths: string[]) =>
    deleteFiles(STORAGE_BUCKETS.INVENTORY_PHOTOS, filePaths),
  list: (userId: string) =>
    listFiles(STORAGE_BUCKETS.INVENTORY_PHOTOS, `${userId}/inventory`),
};

export const receiptStorage = {
  upload: (userId: string, file: File | string, fileName: string) =>
    uploadFile(
      STORAGE_BUCKETS.RECEIPT_SCANS,
      generateUserFilePath(userId, fileName, "receipts"),
      file,
    ),
  getUrl: (filePath: string) =>
    getPublicUrl(STORAGE_BUCKETS.RECEIPT_SCANS, filePath),
  delete: (filePaths: string[]) =>
    deleteFiles(STORAGE_BUCKETS.RECEIPT_SCANS, filePaths),
  list: (userId: string) =>
    listFiles(STORAGE_BUCKETS.RECEIPT_SCANS, `${userId}/receipts`),
};

export const avatarStorage = {
  upload: (userId: string, file: File | string, fileName: string) =>
    uploadFile(
      STORAGE_BUCKETS.USER_AVATARS,
      generateUserFilePath(userId, fileName),
      file,
    ),
  getUrl: (filePath: string) =>
    getPublicUrl(STORAGE_BUCKETS.USER_AVATARS, filePath),
  delete: (filePaths: string[]) =>
    deleteFiles(STORAGE_BUCKETS.USER_AVATARS, filePaths),
  list: (userId: string) => listFiles(STORAGE_BUCKETS.USER_AVATARS, userId),
};

export const loyaltyCardStorage = {
  upload: (userId: string, file: File | string, fileName: string) =>
    uploadFile(
      STORAGE_BUCKETS.LOYALTY_CARDS,
      generateUserFilePath(userId, fileName, "loyalty-cards"),
      file,
    ),
  getUrl: (filePath: string) =>
    getPublicUrl(STORAGE_BUCKETS.LOYALTY_CARDS, filePath),
  delete: (filePaths: string[]) =>
    deleteFiles(STORAGE_BUCKETS.LOYALTY_CARDS, filePaths),
  list: (userId: string) =>
    listFiles(STORAGE_BUCKETS.LOYALTY_CARDS, `${userId}/loyalty-cards`),
};
