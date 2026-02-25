import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { useInvestmentAccounts } from "@/hooks/useInvestmentAccounts";
import { Colors } from "@/constants/colors";
import { formatValue } from "@/utils/currency";

export default function InvestmentsScreen() {
  const { activePortfolioId } = useAppStore();
  const { accounts } = useInvestmentAccounts(activePortfolioId);

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.account.id}
        renderItem={({ item }) => (
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
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No investment accounts yet</Text>
          </View>
        }
      />
      {activePortfolioId && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/investment/create")}
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
