import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/colors";

interface SummaryCardProps {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  info?: string;
  redacted?: boolean;
}

export function SummaryCard({ label, value, unit, color, info, redacted }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {info && (
          <TouchableOpacity
            onPress={() => Alert.alert(label, info)}
            hitSlop={8}
          >
            <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.valueRow}>
        {unit && (
          <Text style={[styles.unit, redacted && styles.redactedText]}>{unit}</Text>
        )}
        <Text
          style={[styles.value, color ? { color } : undefined, redacted && styles.redactedText]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {redacted ? value.replace(/[0-9]/g, "\u2022") : value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    flexShrink: 1,
  },
  unit: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textTertiary,
  },
  redactedText: {
    opacity: 0.3,
  },
});
