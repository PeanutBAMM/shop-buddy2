import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { View, ActivityIndicator } from "react-native";

export const AuthGuard = ({ children, requireAuth = true }) => {
  const router = useRouter();
  const { isAuthenticated, loading } = useApp();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.replace("/auth");
      } else if (!requireAuth && isAuthenticated) {
        router.replace("/");
      }
    }
  }, [isAuthenticated, loading, requireAuth, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return children;
};
