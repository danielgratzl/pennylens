import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { useIncome } from "@/hooks/useIncome";
import { ItemList } from "@/components/ItemList";
import { AnimatedFab } from "@/components/AnimatedFab";
import { Colors } from "@/constants/colors";

export default function IncomeScreen() {
  const { activePortfolioId } = useAppStore();
  const { incomeItems } = useIncome(activePortfolioId);

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
        onPress={(id) => router.push(`/income/${id}`)}
        emptyMessage="No income items yet"
      />
      {activePortfolioId && (
        <AnimatedFab onPress={() => router.push("/income/create")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
