import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { addSnapshot } from "@/hooks/useInvestmentAccounts";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { investmentAccount } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentMonth } from "@/utils/month";
import { Colors } from "@/constants/colors";

export default function CreateSnapshotScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { data: accountData } = useLiveQuery(
    db.select({ currency: investmentAccount.currency }).from(investmentAccount).where(eq(investmentAccount.id, accountId ?? "")),
    [accountId]
  );
  const accountCurrency = accountData?.[0]?.currency ?? "CHF";
  const [valueStr, setValueStr] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [errors, setErrors] = useState<{ value?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!valueStr) {
      e.value = "Value is required";
    } else {
      const value = parseFloat(valueStr.replace(",", "."));
      if (isNaN(value) || value <= 0) e.value = "Value must be greater than 0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !accountId) return;
    const value = parseFloat(valueStr.replace(",", "."));

    try {
      await addSnapshot(accountId, month, value);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to record snapshot");
    }
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

      <Text style={styles.label}>Value ({accountCurrency})</Text>
      <TextInput
        style={[styles.input, errors.value && styles.inputError]}
        value={valueStr}
        onChangeText={setValueStr}
        placeholder="0.00"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="decimal-pad"
      />
      {errors.value && <Text style={styles.errorText}>{errors.value}</Text>}

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
  inputError: { borderColor: Colors.danger },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
  button: {
    backgroundColor: Colors.primary, padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 24,
  },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
