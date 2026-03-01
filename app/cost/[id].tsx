import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { fixedCost, person, category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateCost, deleteCost } from "@/hooks/useCosts";
import { Colors } from "@/constants/colors";
import { formatCents, parseCurrencyInput } from "@/utils/currency";

export default function CostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: rows } = useLiveQuery(
    db
      .select({ cost: fixedCost, person: person, category: category })
      .from(fixedCost)
      .leftJoin(person, eq(fixedCost.personId, person.id))
      .leftJoin(category, eq(fixedCost.categoryId, category.id))
      .where(eq(fixedCost.id, id ?? "")),
    [id]
  );

  const { data: categories } = useLiveQuery(
    db.select().from(category).where(eq(category.type, "fixed_cost"))
  );

  const item = rows?.[0];

  const [editing, setEditing] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editIsYearly, setEditIsYearly] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  const startEdit = () => {
    if (!item) return;
    setEditAmount((item.cost.amount / 100).toString());
    setEditIsYearly(item.cost.isYearly);
    setEditCategoryId(item.cost.categoryId);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!item) return;
    const amount = parseCurrencyInput(editAmount);
    if (amount === null || amount <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than 0.");
      return;
    }
    try {
      await updateCost(item.cost.id, {
        amount,
        isYearly: editIsYearly,
        categoryId: editCategoryId,
      });
      setEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to save changes");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Expense",
      "Delete this expense? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCost(item!.cost.id);
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Failed to delete expense");
            }
          },
        },
      ]
    );
  };

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Expense not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.cost.name}</Text>
          {!editing && (
            <TouchableOpacity onPress={startEdit}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Amount (CHF)</Text>
            <TextInput
              style={styles.input}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
            />

            <View style={styles.switchRow}>
              <Text style={styles.editLabel}>Yearly amount</Text>
              <Switch value={editIsYearly} onValueChange={setEditIsYearly} trackColor={{ true: Colors.primary }} />
            </View>

            <Text style={styles.editLabel}>Category</Text>
            <View style={styles.chips}>
              {(categories ?? []).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, editCategoryId === c.id && styles.chipActive]}
                  onPress={() => setEditCategoryId(c.id)}
                >
                  <Text style={[styles.chipText, editCategoryId === c.id && styles.chipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.amount}>
              {formatCents(item.cost.amount, item.cost.currency)}
              {item.cost.isYearly ? " /year" : " /month"}
            </Text>
            <Text style={styles.meta}>
              {item.category?.name ?? "No category"}
              {item.person ? ` · ${item.person.name}` : " · Shared"}
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8,
  },
  name: { fontSize: 18, fontWeight: "600", color: Colors.text },
  editLink: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  amount: { fontSize: 16, color: Colors.expense, marginTop: 4 },
  meta: { fontSize: 13, color: Colors.textTertiary, marginTop: 4 },
  editSection: { marginTop: 8 },
  editLabel: {
    fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 6, marginTop: 10,
  },
  input: {
    backgroundColor: Colors.background, borderRadius: 10, padding: 12, fontSize: 16,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  switchRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  editActions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16 },
  saveButton: {
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  saveText: { color: Colors.white, fontSize: 15, fontWeight: "600" },
  cancelText: { color: Colors.textSecondary, fontSize: 15 },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
  deleteButton: {
    backgroundColor: Colors.danger, padding: 16, borderRadius: 12, alignItems: "center",
  },
  deleteText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
