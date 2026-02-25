import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { income, person, category } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { deleteIncome } from "@/hooks/useIncomeForMonth";
import { Colors } from "@/constants/colors";
import { formatCents } from "@/utils/currency";
import { displayMonth } from "@/utils/month";

export default function IncomeDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const { data: versions } = useLiveQuery(
    db
      .select({ income: income, person: person, category: category })
      .from(income)
      .leftJoin(person, eq(income.personId, person.id))
      .leftJoin(category, eq(income.categoryId, category.id))
      .where(eq(income.itemGroupId, groupId ?? ""))
      .orderBy(desc(income.effectiveFrom)),
    [groupId]
  );

  const handleDelete = () => {
    const items = versions ?? [];
    Alert.alert(
      "Delete Income",
      `Delete all ${items.length} version(s) of this income item? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              for (const v of items) {
                await deleteIncome(v.income.id);
              }
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Failed to delete income");
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
        keyExtractor={(item) => item.income.id}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index === 0 && styles.cardActive]}>
            {index === 0 && <Text style={styles.badge}>Current</Text>}
            <Text style={styles.name}>{item.income.name}</Text>
            <Text style={styles.amount}>
              {formatCents(item.income.amount, item.income.currency)}
              {item.income.isYearly ? " /year" : " /month"}
            </Text>
            <Text style={styles.period}>
              {displayMonth(item.income.effectiveFrom)}
              {item.income.effectiveUntil
                ? ` – ${displayMonth(item.income.effectiveUntil)}`
                : " – Present"}
            </Text>
            <Text style={styles.meta}>
              {item.category?.name ?? "No category"}
              {item.person ? ` · ${item.person.name}` : " · Shared"}
            </Text>
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
              <Text style={styles.deleteText}>Delete Income</Text>
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
  badge: {
    fontSize: 12, fontWeight: "600", color: Colors.primary,
    marginBottom: 8, textTransform: "uppercase",
  },
  name: { fontSize: 18, fontWeight: "600", color: Colors.text },
  amount: { fontSize: 16, color: Colors.income, marginTop: 4 },
  period: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  meta: { fontSize: 13, color: Colors.textTertiary, marginTop: 4 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
  deleteButton: {
    backgroundColor: Colors.danger,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  deleteText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
