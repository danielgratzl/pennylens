import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { useIncomeForMonth } from "@/hooks/useIncomeForMonth";
import { ItemList } from "@/components/ItemList";
import { Colors } from "@/constants/colors";
import { currentMonth } from "@/utils/month";

export default function IncomeScreen() {
  const { activePortfolioId } = useAppStore();
  const { incomeItems } = useIncomeForMonth(activePortfolioId, currentMonth());

  const items = incomeItems.map((i) => ({
    id: i.income.id,
    name: i.income.name,
    amount: i.income.amount,
    isYearly: i.income.isYearly,
    currency: i.income.currency,
    personName: i.person?.name ?? null,
    categoryName: i.category?.name ?? null,
    categoryColor: i.category?.color ?? null,
  }));

  return (
    <View style={styles.container}>
      <ItemList
        items={items}
        onPress={(id) => {
          const item = incomeItems.find((i) => i.income.id === id);
          if (item) router.push(`/income/${item.income.itemGroupId}`);
        }}
        emptyMessage="No income items yet"
      />
      {activePortfolioId && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/income/create")}
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
