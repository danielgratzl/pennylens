import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useAppStore } from "@/store/appStore";
import { usePersons } from "@/hooks/usePersons";
import { Colors } from "@/constants/colors";

export function ViewModeToggle() {
  const { activePortfolioId, viewMode, setViewMode } = useAppStore();
  const { persons } = usePersons(activePortfolioId);

  const options = persons.length > 1
    ? [{ key: "combined", label: "Combined" }, ...persons.map((p) => ({ key: p.id, label: p.name }))]
    : [];

  if (options.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container} style={styles.scroll}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          onPress={() => setViewMode(opt.key)}
          style={[styles.option, viewMode === opt.key && styles.optionActive]}
        >
          <Text style={[styles.label, viewMode === opt.key && styles.labelActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  optionActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.white,
  },
});
