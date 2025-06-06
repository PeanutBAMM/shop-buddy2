import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Fout", "Vul alle velden in");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          router.replace("/");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create user metadata
          const { error: insertError } = await supabase
            .from("users_metadata")
            .insert({
              user_id: data.user.id,
              email: email,
              registration_source: "Email",
              onboarding_status: false,
            });

          if (insertError) {
            console.error("Error creating user metadata:", insertError);
          }

          router.replace("/onboarding");
        }
      }
    } catch (error: any) {
      Alert.alert("Fout", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      >
        {/* Header */}
        <View
          style={{ paddingTop: 60, paddingBottom: 40, alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#1F2937",
              marginBottom: 8,
            }}
          >
            Welkom bij je
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#3B82F6",
              marginBottom: 16,
            }}
          >
            Slimme Boodschappenlijst
          </Text>
          <Text style={{ color: "#6B7280", textAlign: "center" }}>
            {isLogin
              ? "Log in om verder te gaan"
              : "Maak een account aan om te beginnen"}
          </Text>
        </View>

        {/* Form */}
        <View style={{ flex: 1 }}>
          {/* Name Input (Registration only) */}
          {!isLogin && (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ marginBottom: 8, color: "#374151", fontWeight: "500" }}
              >
                Naam
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    borderWidth: 2,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    padding: 16,
                    paddingRight: 48,
                    fontSize: 16,
                    backgroundColor: "white",
                  }}
                  value={name}
                  onChangeText={setName}
                  placeholder="Voer je naam in"
                  autoCapitalize="words"
                />
                <View style={{ position: "absolute", right: 16, top: 16 }}>
                  <User size={20} color="#6B7280" />
                </View>
              </View>
            </View>
          )}

          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{ marginBottom: 8, color: "#374151", fontWeight: "500" }}
            >
              E-mailadres
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={{
                  borderWidth: 2,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  padding: 16,
                  paddingRight: 48,
                  fontSize: 16,
                  backgroundColor: "white",
                }}
                value={email}
                onChangeText={setEmail}
                placeholder="Voer je e-mailadres in"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={{ position: "absolute", right: 16, top: 16 }}>
                <Mail size={20} color="#6B7280" />
              </View>
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{ marginBottom: 8, color: "#374151", fontWeight: "500" }}
            >
              Wachtwoord
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={{
                  borderWidth: 2,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  padding: 16,
                  paddingRight: 48,
                  fontSize: 16,
                  backgroundColor: "white",
                }}
                value={password}
                onChangeText={setPassword}
                placeholder="Voer je wachtwoord in"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 16, top: 16 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleAuth}
            disabled={loading}
            style={{
              backgroundColor: "#3B82F6",
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                {isLogin ? "Inloggen" : "Account aanmaken"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch Mode */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6B7280" }}>
              {isLogin ? "Nog geen account? " : "Al een account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={{ color: "#3B82F6", fontWeight: "500" }}>
                {isLogin ? "Registreren" : "Inloggen"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
