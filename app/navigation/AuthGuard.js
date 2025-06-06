import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../context/AppContext";

export const AuthGuard = ({ children, requireAuth = true }) => {
  const navigation = useNavigation();
  const { isAuthenticated, loading } = useApp();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else if (!requireAuth && isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    }
  }, [isAuthenticated, loading, requireAuth, navigation]);

  if (loading) {
    return null; // Or a loading screen
  }

  return children;
};
