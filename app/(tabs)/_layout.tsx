import { Tabs, router } from "expo-router";
import { Colors } from "@/constants/colors";
import { TouchableOpacity } from "react-native";
import { PortfolioPicker } from "@/components/PortfolioPicker";
import Ionicons from "@expo/vector-icons/Ionicons";

function HeaderRight() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/settings/categories")}
      style={{ marginRight: 12 }}
    >
      <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerTitle: () => <PortfolioPicker />,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          tabBarLabel: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="arrow-down-outline" size={size} color={color} />,
          tabBarLabel: "Income",
        }}
      />
      <Tabs.Screen
        name="costs"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="arrow-up-outline" size={size} color={color} />,
          tabBarLabel: "Costs",
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" size={size} color={color} />,
          tabBarLabel: "Invest",
        }}
      />
      <Tabs.Screen
        name="sankey"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="git-merge-outline" size={size} color={color} />,
          tabBarLabel: "Flow",
        }}
      />
    </Tabs>
  );
}
