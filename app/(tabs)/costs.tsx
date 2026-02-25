import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { useCostsForMonth } from "@/hooks/useCostsForMonth";
import { ItemList } from "@/components/ItemList";
import { Colors } from "@/constants/colors";
import { currentMonth } from "@/utils/month";

export default function CostsScreen() {
  const { activePortfolioId } = useAppStore();
  const { costItems } = useCostsForMonth(activePortfolioId, currentMonth());

  const items = costItems.map((i) => ({
    id: i.cost.id,
    name: i.cost.name,
    amount: i.cost.amount,
    isYearly: i.cost.isYearly,
    currency: i.cost.currency,
    personName: i.person?.name ?? null,
    categoryName: i.category?.name ?? null,
    categoryColor: i.category?.color ?? null,
  }));

  return (
    <View style={styles.container}>
      <ItemList
        items={items}
        onPress={(id) => {
          const item = costItems.find((i) => i.cost.id === id);
          if (item) router.push(`/cost/${item.cost.itemGroupId}`);
        }}
        emptyMessage="No fixed costs yet"
      />
      {activePortfolioId && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/cost/create")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    fontSize: 28,
    color: Colors.white,
    lineHeight: 30,
  },
});
