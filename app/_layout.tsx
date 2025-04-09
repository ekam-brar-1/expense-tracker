
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


  useEffect(() => {
    setLoading(false);
  }, []);

  
  const publicRoutes = ["/login", "/signup"];

 
  useEffect(() => {
    if (!loading) {
      if (!user && !publicRoutes.includes(pathname)) {
        router.replace("/login");
      }
     
      else if (user && publicRoutes.includes(pathname)) {
        router.replace("/(tabs)"); 
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
