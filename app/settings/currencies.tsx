import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/colors";
import {
  useBaseCurrency,
  useCurrencies,
  setBaseCurrency,
  addCurrency,
  updateCurrencyRate,
  deleteCurrency,
} from "@/hooks/useCurrencies";

const COMMON_CURRENCIES = ["CHF", "EUR", "USD", "GBP"];

export default function CurrenciesScreen() {
  const baseCurrency = useBaseCurrency();
  const { currencies } = useCurrencies();

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");

  const handleSetBase = (code: string) => {
    if (code === baseCurrency) return;
    Alert.alert(
      "Change Base Currency",
      `Switch base currency to ${code}? Existing income and cost amounts will NOT be auto-converted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change",
          onPress: () => setBaseCurrency(code),
        },
      ]
    );
  };

  const handleEditRate = (code: string, currentRate: number) => {
    Alert.prompt(
      `Edit ${code} Rate`,
      `1 ${code} = ? ${baseCurrency}\nCurrent: ${currentRate}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (value?: string) => {
            const rate = parseFloat(value ?? "");
            if (isNaN(rate) || rate <= 0) {
              Alert.alert("Invalid Rate", "Rate must be a positive number");
              return;
            }
            updateCurrencyRate(code, rate);
          },
        },
      ],
      "plain-text",
      String(currentRate)
    );
  };

  const handleDelete = (code: string) => {
    Alert.alert(
      "Delete Currency",
      `Remove ${code}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCurrency(code);
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Failed to delete currency");
            }
          },
        },
      ]
    );
  };

  const handleAdd = async () => {
    const code = newCode.trim().toUpperCase();
    const name = newName.trim();
    const rate = parseFloat(newRate.replace(",", "."));

    if (!code || code.length !== 3) {
      Alert.alert("Invalid Code", "Currency code must be 3 letters (e.g. USD)");
      return;
    }
    if (!name) {
      Alert.alert("Missing Name", "Please enter a currency name");
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      Alert.alert("Invalid Rate", "Rate must be a positive number");
      return;
    }
    if (code === baseCurrency || currencies.some((c) => c.code === code)) {
      Alert.alert("Duplicate", `${code} already exists`);
      return;
    }

    try {
      await addCurrency(code, name, rate);
      setNewCode("");
      setNewName("");
      setNewRate("");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to add currency");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Base Currency</Text>
      <View style={styles.chips}>
        {COMMON_CURRENCIES.map((code) => (
          <TouchableOpacity
            key={code}
            style={[styles.chip, baseCurrency === code && styles.chipActive]}
            onPress={() => handleSetBase(code)}
          >
            <Text style={[styles.chipText, baseCurrency === code && styles.chipTextActive]}>
              {code}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Additional Currencies</Text>
      <Text style={styles.hint}>
        Conversion rates: how many {baseCurrency} per 1 unit of foreign currency
      </Text>

      {currencies.length === 0 && (
        <Text style={styles.emptyText}>No additional currencies configured</Text>
      )}

      {currencies.map((c) => (
        <TouchableOpacity
          key={c.code}
          style={styles.currencyRow}
          onPress={() => handleEditRate(c.code, c.rate)}
          onLongPress={() => handleDelete(c.code)}
        >
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyCode}>{c.code}</Text>
            <Text style={styles.currencyName}>{c.name}</Text>
          </View>
          <View style={styles.rateContainer}>
            <Text style={styles.rateText}>{c.rate}</Text>
            <Ionicons name="pencil-outline" size={14} color={Colors.textTertiary} />
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.addSection}>
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
          Add Currency
        </Text>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={newCode}
            onChangeText={setNewCode}
            placeholder="Code"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="characters"
            maxLength={3}
          />
          <TextInput
            style={[styles.input, styles.inputMedium]}
            value={newName}
            onChangeText={setNewName}
            placeholder="Name"
            placeholderTextColor={Colors.textTertiary}
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={newRate}
            onChangeText={setNewRate}
            placeholder="Rate"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="decimal-pad"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add Currency</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 12,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
    marginBottom: 8,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  currencyInfo: { flex: 1 },
  currencyCode: { fontSize: 15, fontWeight: "600", color: Colors.text },
  currencyName: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  rateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rateText: { fontSize: 15, fontWeight: "500", color: Colors.primary },
  addSection: {},
  addRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputSmall: { width: 72 },
  inputMedium: { flex: 1 },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: { color: Colors.white, fontSize: 15, fontWeight: "600" },
});
