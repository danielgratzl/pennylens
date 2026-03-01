import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  useSnapshots, useInvestmentAccounts,
  deleteInvestmentAccount, deleteSnapshot, updateInvestmentAccount,
} from "@/hooks/useInvestmentAccounts";
import { useBaseCurrency } from "@/hooks/useCurrencies";
import { usePersons } from "@/hooks/usePersons";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { investmentAccount, category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SnapshotChart } from "@/components/SnapshotChart";
import { Colors } from "@/constants/colors";
import { formatValue } from "@/utils/currency";
import { displayMonth } from "@/utils/month";

export default function InvestmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { snapshots } = useSnapshots(id ?? "");
  const baseCurrency = useBaseCurrency();

  const { data: accountRows } = useLiveQuery(
    db.select().from(investmentAccount).where(eq(investmentAccount.id, id ?? "")),
    [id]
  );
  const account = accountRows?.[0];
  const accountCurrency = account?.currency ?? "CHF";
  const isForeignCurrency = accountCurrency !== baseCurrency;

  const { persons } = usePersons(account?.portfolioId ?? null);
  const { data: categories } = useLiveQuery(
    db.select().from(category).where(eq(category.type, "investment"))
  );

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAccountType, setEditAccountType] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editPersonId, setEditPersonId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  const startEdit = () => {
    if (!account) return;
    setEditName(account.name);
    setEditAccountType(account.accountType ?? "");
    setEditInstitution(account.institution ?? "");
    setEditPersonId(account.personId);
    setEditCategoryId(account.categoryId);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!account) return;
    if (!editName.trim()) {
      Alert.alert("Invalid Name", "Account name is required.");
      return;
    }
    try {
      await updateInvestmentAccount(account.id, {
        name: editName.trim(),
        accountType: editAccountType.trim() || null,
        institution: editInstitution.trim() || null,
        personId: editPersonId,
        categoryId: editCategoryId,
      });
      setEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to save changes");
    }
  };

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

  if (!account) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Account not found</Text>
      </View>
    );
  }

  const personName = persons.find((p) => p.id === account.personId)?.name;
  const categoryName = (categories ?? []).find((c) => c.id === account.categoryId)?.name;

  const header = (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{account.name}</Text>
          {!editing && (
            <TouchableOpacity onPress={startEdit}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Account name"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.editLabel}>Account Type</Text>
            <TextInput
              style={styles.input}
              value={editAccountType}
              onChangeText={setEditAccountType}
              placeholder="e.g. Brokerage, ISA, 401k"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.editLabel}>Institution</Text>
            <TextInput
              style={styles.input}
              value={editInstitution}
              onChangeText={setEditInstitution}
              placeholder="e.g. Trade Republic"
              placeholderTextColor={Colors.textTertiary}
            />

            {persons.length > 1 && (
              <>
                <Text style={styles.editLabel}>Person</Text>
                <View style={styles.chips}>
                  <TouchableOpacity
                    style={[styles.chip, editPersonId === null && styles.chipActive]}
                    onPress={() => setEditPersonId(null)}
                  >
                    <Text style={[styles.chipText, editPersonId === null && styles.chipTextActive]}>
                      Shared
                    </Text>
                  </TouchableOpacity>
                  {persons.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.chip, editPersonId === p.id && styles.chipActive]}
                      onPress={() => setEditPersonId(p.id)}
                    >
                      <Text style={[styles.chipText, editPersonId === p.id && styles.chipTextActive]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.editLabel}>Category</Text>
            <View style={styles.chips}>
              {(categories ?? []).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, editCategoryId === c.id && styles.chipActive]}
                  onPress={() => setEditCategoryId(c.id)}
                >
                  <Text style={[styles.chipText, editCategoryId === c.id && styles.chipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.meta}>
            {categoryName ?? "Uncategorized"}
            {personName ? ` · ${personName}` : ""}
            {account.institution ? ` · ${account.institution}` : ""}
            {account.accountType ? ` · ${account.accountType}` : ""}
            {isForeignCurrency ? ` · ${accountCurrency}` : ""}
          </Text>
        )}
      </View>

      <SnapshotChart snapshots={snapshots} height={200} currency={accountCurrency} />

      <View style={styles.snapshotHeader}>
        <Text style={styles.sectionTitle}>Snapshots</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/investment/snapshot/create", params: { accountId: id } })}
        >
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={snapshots}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
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
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 16 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4,
  },
  name: { fontSize: 18, fontWeight: "600", color: Colors.text, flex: 1 },
  editLink: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  editSection: { marginTop: 8 },
  editLabel: {
    fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 6, marginTop: 10,
  },
  input: {
    backgroundColor: Colors.background, borderRadius: 10, padding: 12, fontSize: 16,
    color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  editActions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16 },
  saveButton: {
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  saveText: { color: Colors.white, fontSize: 15, fontWeight: "600" },
  cancelText: { color: Colors.textSecondary, fontSize: 15 },
  snapshotHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: Colors.text },
  addText: { fontSize: 15, fontWeight: "500", color: Colors.primary },
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
