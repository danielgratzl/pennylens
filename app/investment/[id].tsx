import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSnapshots } from "@/hooks/useInvestmentAccounts";
import { SnapshotChart } from "@/components/SnapshotChart";
import { Colors } from "@/constants/colors";
import { formatValue } from "@/utils/currency";
import { displayMonth } from "@/utils/month";

export default function InvestmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { snapshots } = useSnapshots(id ?? "");

  return (
    <View style={styles.container}>
      <SnapshotChart snapshots={snapshots} height={200} />

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
          <View style={styles.row}>
            <Text style={styles.month}>{displayMonth(item.snapshotMonth)}</Text>
            <Text style={styles.value}>{formatValue(item.value)}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No snapshots yet. Add your first one!</Text>
          </View>
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
  list: { paddingHorizontal: 16 },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.surface, padding: 14, borderRadius: 10, marginBottom: 8,
  },
  month: { fontSize: 15, color: Colors.text },
  value: { fontSize: 15, fontWeight: "600", color: Colors.investment },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
});
