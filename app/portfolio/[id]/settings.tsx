import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/colors";

export default function PortfolioSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Portfolio Settings</Text>
      <Text style={styles.subtext}>ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  text: { fontSize: 20, fontWeight: "600", color: Colors.text },
  subtext: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },
});
