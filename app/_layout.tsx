// app/_layout.tsx
"use client";

import { Slot, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./auth-context";

function RootContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // We assume that the initial supabase session check is handled within our AuthProvider.
  useEffect(() => {
    setLoading(false);
  }, []);

  // Define public routes (e.g., login & signup)
  const publicRoutes = ["/login", "/signup"];

  // If user is not authenticated and is not on a public route, redirect to login.
  useEffect(() => {
    if (!loading) {
      if (!user && !publicRoutes.includes(pathname)) {
        router.replace("/login");
      }
      // Optionally, redirect an authenticated user away from public routes.
      else if (user && publicRoutes.includes(pathname)) {
        router.replace("/(tabs)"); // assuming your tabs layout is inside the (tabs) folder
      }
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}
