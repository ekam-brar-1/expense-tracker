// app/(app)/_layout.tsx
import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#333", // Dark color for active tab
        tabBarInactiveTintColor: "#888", // Grey for inactive tab
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#eee",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <Image
              source={require("../../assets/home-icon.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#333" : "#888",
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reportScreen"
        options={{
          title: "Reports",
          tabBarIcon: ({ focused, color }) => (
            <Image
              source={require("../../assets/graph-icon.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#333" : "#888",
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scanner",
          tabBarIcon: ({ focused, color }) => (
            <Image
              source={require("../../assets/scan-icon.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#333" : "#888",
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Image
              source={require("../../assets/account-icon.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#333" : "#888",
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
