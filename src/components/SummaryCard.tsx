import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

interface SummaryCardProps {
  label: string;
  value: string;
  color?: string;
  subtitle?: string;
  redacted?: boolean;
}

export function SummaryCard({ label, value, color, subtitle, redacted }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <Text style={[styles.value, color ? { color } : undefined, redacted && styles.redactedText]}>
          {redacted ? value.replace(/[0-9]/g, "•") : value}
        </Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  redactedText: {
    opacity: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
