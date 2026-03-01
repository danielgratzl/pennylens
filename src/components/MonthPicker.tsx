import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/colors";
import { type YearMonth, displayMonth, incrementMonth, decrementMonth } from "@/utils/month";

interface Props {
  value: YearMonth;
  onChange: (value: YearMonth) => void;
}

export function MonthPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrow}
        onPress={() => onChange(decrementMonth(value))}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.primary} />
      </TouchableOpacity>

      <Text style={styles.label}>{displayMonth(value)}</Text>

      <TouchableOpacity
        style={styles.arrow}
        onPress={() => onChange(incrementMonth(value))}
      >
        <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  arrow: {
    padding: 8,
  },
  label: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
});
