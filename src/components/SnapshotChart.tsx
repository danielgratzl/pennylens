import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Colors } from "@/constants/colors";
import { formatValue } from "@/utils/currency";
import { displayMonth } from "@/utils/month";

interface Snapshot {
  snapshotMonth: string;
  value: number;
}

interface Props {
  snapshots: Snapshot[];
  height?: number;
  redacted?: boolean;
}

export function SnapshotChart({ snapshots, height = 200, redacted }: Props) {
  if (snapshots.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No snapshots recorded yet</Text>
      </View>
    );
  }

  const sorted = [...snapshots].sort((a, b) => a.snapshotMonth.localeCompare(b.snapshotMonth));

  const chartData = sorted.map((s) => ({
    value: s.value,
    label: displayMonth(s.snapshotMonth),
    dataPointText: redacted ? "" : formatValue(s.value),
  }));

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        height={height}
        color={Colors.investment}
        dataPointsColor={Colors.investment}
        thickness={2}
        startFillColor={Colors.investmentLight}
        endFillColor={Colors.surface}
        startOpacity={0.3}
        endOpacity={0.05}
        areaChart

        hideRules
        hideYAxisText={redacted}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisLabel}
        spacing={60}
        noOfSections={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
  axisText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  axisLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    width: 50,
  },
});
