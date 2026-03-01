import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { useCosts } from "@/hooks/useCosts";
import { ItemList } from "@/components/ItemList";
import { AnimatedFab } from "@/components/AnimatedFab";
import { Colors } from "@/constants/colors";

export default function CostsScreen() {
  const { activePortfolioId } = useAppStore();
  const { costItems } = useCosts(activePortfolioId);

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
        onPress={(id) => router.push(`/cost/${id}`)}
        emptyMessage="No expenses yet"
      />
      {activePortfolioId && (
        <AnimatedFab onPress={() => router.push("/cost/create")} />
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
