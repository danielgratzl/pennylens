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
  currency?: string;
}

const NUM_SECTIONS = 4;

function niceStep(rawStep: number, useKSteps: boolean): number {
  if (rawStep <= 0) return 1;
  if (useKSteps) {
    // Round up to next 1000
    return Math.max(1000, Math.ceil(rawStep / 1000) * 1000);
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const fraction = rawStep / magnitude;
  let nice: number;
  if (fraction <= 1) nice = 1;
  else if (fraction <= 2) nice = 2;
  else if (fraction <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

function formatYLabel(label: string): string {
  const val = Number(label);
  if (val >= 1000) return `${Math.round(val / 1000)}k`;
  return String(Math.round(val));
}

export function SnapshotChart({ snapshots, height = 200, redacted, currency }: Props) {
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
    dataPointText: redacted ? "" : formatValue(s.value, currency),
  }));

  const maxVal = Math.max(...sorted.map((s) => s.value));
  const useK = maxVal >= 1000;
  const stepValue = niceStep(maxVal / NUM_SECTIONS, useK);
  const maxValue = stepValue * NUM_SECTIONS;

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
        formatYLabel={formatYLabel}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisLabel}
        initialSpacing={30}
        spacing={60}
        noOfSections={NUM_SECTIONS}
        maxValue={maxValue}
        stepValue={stepValue}
        scrollToEnd
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
