import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { addSnapshot } from "@/hooks/useInvestmentAccounts";
import { currentMonth } from "@/utils/month";
import { Colors } from "@/constants/colors";

export default function CreateSnapshotScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const [valueStr, setValueStr] = useState("");
  const [month, setMonth] = useState(currentMonth());

  const handleCreate = async () => {
    if (!accountId || !valueStr) return;
    const value = parseFloat(valueStr.replace(",", "."));
    if (isNaN(value)) return;

    await addSnapshot(accountId, month, value);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Month</Text>
      <TextInput
        style={styles.input}
        value={month}
        onChangeText={setMonth}
        placeholder="YYYY-MM"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={styles.label}>Value (CHF)</Text>
      <TextInput
        style={styles.input}
        value={valueStr}
        onChangeText={setValueStr}
        placeholder="0.00"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Record Snapshot</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.background },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 14, fontSize: 16,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary, padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 24,
  },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
