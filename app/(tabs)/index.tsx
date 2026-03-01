import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppStore } from "@/store/appStore";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { usePortfolios } from "@/hooks/usePortfolios";
import { usePersons } from "@/hooks/usePersons";
import { useInvestmentTotal, useInvestmentHistory } from "@/hooks/useInvestmentAccounts";
import { useBaseCurrency } from "@/hooks/useCurrencies";
import { SnapshotChart } from "@/components/SnapshotChart";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { SummaryCard } from "@/components/SummaryCard";
import { Colors } from "@/constants/colors";
import { formatCentsShort, formatValueShort } from "@/utils/currency";
import { useEffect } from "react";

export default function DashboardScreen() {
  const { activePortfolioId, viewMode, setActivePortfolio, privacyMode, togglePrivacyMode } = useAppStore();
  const { portfolios } = usePortfolios();
  const { persons } = usePersons(activePortfolioId);
  const baseCurrency = useBaseCurrency();
  const summary = useMonthlySummary(activePortfolioId, viewMode);
  const { total: investmentTotal } = useInvestmentTotal(activePortfolioId, viewMode, persons.length);
  const { history: investmentHistory } = useInvestmentHistory(activePortfolioId, viewMode, persons.length);

  useEffect(() => {
    if (!activePortfolioId && portfolios.length > 0) {
      setActivePortfolio(portfolios[0].id);
    }
  }, [portfolios, activePortfolioId, setActivePortfolio]);

  if (!activePortfolioId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Welcome to PennyLens</Text>
        <Text style={styles.emptySubtitle}>Create a portfolio to get started</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/portfolio/create")}
        >
          <Text style={styles.createButtonText}>Create Portfolio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.toggleWrapper}>
          <ViewModeToggle />
        </View>
        <TouchableOpacity onPress={togglePrivacyMode} style={styles.privacyButton}>
          <Ionicons
            name={privacyMode ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cards}>
        <SummaryCard
          label="Income"
          value={formatCentsShort(summary.totalIncome)}
          unit={baseCurrency}
          color={Colors.income}
          redacted={privacyMode}
        />
        <SummaryCard
          label="Costs"
          value={formatCentsShort(summary.totalCosts)}
          unit={baseCurrency}
          color={Colors.expense}
          redacted={privacyMode}
        />
        <SummaryCard
          label="Untracked"
          value={formatCentsShort(summary.untracked)}
          unit={baseCurrency}
          color={Colors.textTertiary}
          info="Income minus fixed costs"
          redacted={privacyMode}
        />
      </View>

      <SummaryCard
        label="Investments"
        value={formatValueShort(investmentTotal)}
        unit={baseCurrency}
        color={Colors.investment}
        redacted={privacyMode}
      />

      {investmentHistory.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Investment History</Text>
          <SnapshotChart snapshots={investmentHistory} height={180} redacted={privacyMode} currency={baseCurrency} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  toggleWrapper: {
    flex: 1,
  },
  privacyButton: {
    padding: 8,
    marginRight: 4,
  },
  cards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  chartSection: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: Colors.background,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
