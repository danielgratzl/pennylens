import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppStore } from "@/store/appStore";
import { displayMonth } from "@/utils/month";
import { Colors } from "@/constants/colors";

export function MonthSelector() {
  const { selectedMonth, nextMonth, prevMonth } = useAppStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={prevMonth} style={styles.arrow}>
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.month}>{displayMonth(selectedMonth)}</Text>
      <TouchableOpacity onPress={nextMonth} style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 16,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 24,
    color: Colors.text,
    lineHeight: 28,
  },
  month: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    minWidth: 120,
    textAlign: "center",
  },
});
