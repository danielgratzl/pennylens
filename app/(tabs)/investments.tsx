import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { useInvestmentAccounts } from "@/hooks/useInvestmentAccounts";
import { AnimatedFab } from "@/components/AnimatedFab";
import { Colors } from "@/constants/colors";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function InvestmentsScreen() {
  const { activePortfolioId } = useAppStore();
  const { accounts } = useInvestmentAccounts(activePortfolioId);

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.account.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={index < 10 ? FadeInDown.delay(index * 50).duration(300) : undefined}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/investment/${item.account.id}`)}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.accountName}>{item.account.name}</Text>
                <Text style={styles.meta}>
                  {item.category?.name ?? "Uncategorized"}
                  {item.person ? ` · ${item.person.name}` : ""}
                  {item.account.institution ? ` · ${item.account.institution}` : ""}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No investment accounts yet</Text>
          </View>
        }
      />
      {activePortfolioId && (
        <AnimatedFab onPress={() => router.push("/investment/create")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  meta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
});
