import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <Text style={styles.subtext}>Categories, sync, and export options will go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, backgroundColor: Colors.background },
  text: { fontSize: 20, fontWeight: "600", color: Colors.text },
  subtext: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: "center" },
});
