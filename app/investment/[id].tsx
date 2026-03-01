import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSnapshots, deleteInvestmentAccount, deleteSnapshot } from "@/hooks/useInvestmentAccounts";
import { useBaseCurrency } from "@/hooks/useCurrencies";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { investmentAccount } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SnapshotChart } from "@/components/SnapshotChart";
import { Colors } from "@/constants/colors";
import { formatValue } from "@/utils/currency";
import { displayMonth } from "@/utils/month";

export default function InvestmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { snapshots } = useSnapshots(id ?? "");
  const baseCurrency = useBaseCurrency();
  const { data: accountData } = useLiveQuery(
    db.select({ currency: investmentAccount.currency }).from(investmentAccount).where(eq(investmentAccount.id, id ?? "")),
    [id]
  );
  const accountCurrency = accountData?.[0]?.currency ?? "CHF";
  const isForeignCurrency = accountCurrency !== baseCurrency;

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Delete this investment account and all its snapshots? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteInvestmentAccount(id!);
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  const handleDeleteSnapshot = (snapshotId: string, month: string) => {
    Alert.alert(
      "Delete Snapshot",
      `Delete the snapshot for ${displayMonth(month)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSnapshot(snapshotId);
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Failed to delete snapshot");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SnapshotChart snapshots={snapshots} height={200} currency={accountCurrency} />

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Snapshots</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/investment/snapshot/create", params: { accountId: id } })}
        >
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={snapshots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onLongPress={() => handleDeleteSnapshot(item.id, item.snapshotMonth)}
          >
            <Text style={styles.month}>{displayMonth(item.snapshotMonth)}</Text>
            <View style={styles.valueColumn}>
              <Text style={styles.value}>{formatValue(item.value, accountCurrency)}</Text>
              {isForeignCurrency && item.baseValue != null && (
                <Text style={styles.baseValue}>{formatValue(item.baseValue, baseCurrency)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No snapshots yet. Add your first one!</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: Colors.text },
  addText: { fontSize: 15, fontWeight: "500", color: Colors.primary },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.surface, padding: 14, borderRadius: 10, marginBottom: 8,
  },
  month: { fontSize: 15, color: Colors.text },
  valueColumn: { alignItems: "flex-end" as const },
  value: { fontSize: 15, fontWeight: "600", color: Colors.investment },
  baseValue: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
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
