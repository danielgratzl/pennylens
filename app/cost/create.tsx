import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { usePersons } from "@/hooks/usePersons";
import { createCost } from "@/hooks/useCostsForMonth";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseCurrencyInput } from "@/utils/currency";
import { currentMonth } from "@/utils/month";
import { Colors } from "@/constants/colors";

export default function CreateCostScreen() {
  const { activePortfolioId } = useAppStore();
  const { persons } = usePersons(activePortfolioId);
  const { data: categories } = useLiveQuery(
    db.select().from(category).where(eq(category.type, "fixed_cost"))
  );

  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!activePortfolioId || !name.trim() || !amountStr) return;
    const amount = parseCurrencyInput(amountStr);
    if (amount === null || amount <= 0) return;

    await createCost({
      portfolioId: activePortfolioId,
      personId: selectedPersonId,
      categoryId: selectedCategoryId,
      name: name.trim(),
      amount,
      isYearly,
      currency: "CHF",
      effectiveFrom: currentMonth(),
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Monthly Rent"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={styles.label}>Amount (CHF)</Text>
      <TextInput
        style={styles.input}
        value={amountStr}
        onChangeText={setAmountStr}
        placeholder="0.00"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="decimal-pad"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Yearly amount</Text>
        <Switch value={isYearly} onValueChange={setIsYearly} trackColor={{ true: Colors.primary }} />
      </View>

      <Text style={styles.label}>Person</Text>
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, selectedPersonId === null && styles.chipActive]}
          onPress={() => setSelectedPersonId(null)}
        >
          <Text style={[styles.chipText, selectedPersonId === null && styles.chipTextActive]}>
            Shared
          </Text>
        </TouchableOpacity>
        {persons.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.chip, selectedPersonId === p.id && styles.chipActive]}
            onPress={() => setSelectedPersonId(p.id)}
          >
            <Text style={[styles.chipText, selectedPersonId === p.id && styles.chipTextActive]}>
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.chips}>
        {(categories ?? []).map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.chip,
              selectedCategoryId === c.id && styles.chipActive,
              c.color ? { borderColor: c.color } : undefined,
            ]}
            onPress={() => setSelectedCategoryId(c.id)}
          >
            <Text style={[styles.chipText, selectedCategoryId === c.id && styles.chipTextActive]}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Add Fixed Cost</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 14, fontSize: 16,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  switchLabel: { fontSize: 15, color: Colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  button: {
    backgroundColor: Colors.primary, padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 24,
  },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
