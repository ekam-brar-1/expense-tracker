"use client";

import { Slot, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Check the Supabase session
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Perform navigation in an effect after mount to avoid navigating during render
  useEffect(() => {
    // List of routes that don't require authentication
    const publicRoutes = ["/login", "/signup"];
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.replace("/login");
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
