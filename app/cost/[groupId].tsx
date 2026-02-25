import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert, Switch,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { fixedCost, person, category } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { deleteCost, editCostFromMonth } from "@/hooks/useCostsForMonth";
import { Colors } from "@/constants/colors";
import { formatCents, parseCurrencyInput } from "@/utils/currency";
import { displayMonth, currentMonth } from "@/utils/month";

export default function CostDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const { data: versions } = useLiveQuery(
    db
      .select({ cost: fixedCost, person: person, category: category })
      .from(fixedCost)
      .leftJoin(person, eq(fixedCost.personId, person.id))
      .leftJoin(category, eq(fixedCost.categoryId, category.id))
      .where(eq(fixedCost.itemGroupId, groupId ?? ""))
      .orderBy(desc(fixedCost.effectiveFrom)),
    [groupId]
  );

  const { data: categories } = useLiveQuery(
    db.select().from(category).where(eq(category.type, "fixed_cost"))
  );

  const [editing, setEditing] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editIsYearly, setEditIsYearly] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  const current = (versions ?? [])[0];

  const startEdit = () => {
    if (!current) return;
    const cents = current.cost.amount;
    setEditAmount((cents / 100).toString());
    setEditIsYearly(current.cost.isYearly);
    setEditCategoryId(current.cost.categoryId);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!current) return;
    const amount = parseCurrencyInput(editAmount);
    if (amount === null || amount <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than 0.");
      return;
    }
    try {
      await editCostFromMonth(current.cost.id, currentMonth(), {
        name: current.cost.name,
        amount,
        isYearly: editIsYearly,
        currency: current.cost.currency,
        personId: current.cost.personId,
        categoryId: editCategoryId,
      });
      setEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to save changes");
    }
  };

  const handleDelete = () => {
    const items = versions ?? [];
    Alert.alert(
      "Delete Cost",
      `Delete all ${items.length} version(s) of this cost item? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              for (const v of items) {
                await deleteCost(v.cost.id);
              }
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Failed to delete cost");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={versions ?? []}
        keyExtractor={(item) => item.cost.id}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index === 0 && styles.cardActive]}>
            {index === 0 && (
              <View style={styles.cardHeader}>
                <Text style={styles.badge}>Current</Text>
                {!editing && (
                  <TouchableOpacity onPress={startEdit}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <Text style={styles.name}>{item.cost.name}</Text>

            {index === 0 && editing ? (
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
                <Text style={styles.period}>
                  {displayMonth(item.cost.effectiveFrom)}
                  {item.cost.effectiveUntil
                    ? ` – ${displayMonth(item.cost.effectiveUntil)}`
                    : " – Present"}
                </Text>
                <Text style={styles.meta}>
                  {item.category?.name ?? "No category"}
                  {item.person ? ` · ${item.person.name}` : " · Shared"}
                </Text>
              </>
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No versions found</Text>
          </View>
        }
        ListFooterComponent={
          (versions ?? []).length > 0 ? (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete Cost</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardActive: { borderColor: Colors.primary },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    fontSize: 12, fontWeight: "600", color: Colors.primary,
    textTransform: "uppercase",
  },
  editLink: {
    fontSize: 14, fontWeight: "600", color: Colors.primary,
  },
  name: { fontSize: 18, fontWeight: "600", color: Colors.text },
  amount: { fontSize: 16, color: Colors.expense, marginTop: 4 },
  period: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  meta: { fontSize: 13, color: Colors.textTertiary, marginTop: 4 },
  editSection: { marginTop: 12 },
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
  editActions: {
    flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  saveText: { color: Colors.white, fontSize: 15, fontWeight: "600" },
  cancelText: { color: Colors.textSecondary, fontSize: 15 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
  deleteButton: {
    backgroundColor: Colors.danger, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 8,
  },
  deleteText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
