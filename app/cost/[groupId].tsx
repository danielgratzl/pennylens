import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { fixedCost, person, category } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Colors } from "@/constants/colors";
import { formatCents } from "@/utils/currency";
import { displayMonth } from "@/utils/month";

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

  return (
    <View style={styles.container}>
      <FlatList
        data={versions ?? []}
        keyExtractor={(item) => item.cost.id}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index === 0 && styles.cardActive]}>
            {index === 0 && <Text style={styles.badge}>Current</Text>}
            <Text style={styles.name}>{item.cost.name}</Text>
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
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No versions found</Text>
          </View>
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
  amount: { fontSize: 16, color: Colors.expense, marginTop: 4 },
  period: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  meta: { fontSize: 13, color: Colors.textTertiary, marginTop: 4 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
});
