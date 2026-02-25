import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { usePortfolios } from "@/hooks/usePortfolios";
import { Colors } from "@/constants/colors";

export function PortfolioPicker() {
  const [open, setOpen] = useState(false);
  const { activePortfolioId, setActivePortfolio } = useAppStore();
  const { portfolios } = usePortfolios();

  const active = portfolios.find((p) => p.id === activePortfolioId);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {active?.name ?? "Select Portfolio"}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Portfolios</Text>

            <FlatList
              data={portfolios}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.row,
                    item.id === activePortfolioId && styles.rowActive,
                  ]}
                  onPress={() => {
                    setActivePortfolio(item.id);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.rowText,
                      item.id === activePortfolioId && styles.rowTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.id === activePortfolioId && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>No portfolios yet</Text>
              }
            />

            <TouchableOpacity
              style={styles.createRow}
              onPress={() => {
                setOpen(false);
                router.push("/portfolio/create");
              }}
            >
              <Text style={styles.createText}>+ New Portfolio</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    maxWidth: 160,
  },
  chevron: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: "100%",
    maxHeight: 400,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  rowActive: {
    backgroundColor: Colors.surfaceSecondary,
  },
  rowText: {
    fontSize: 16,
    color: Colors.text,
  },
  rowTextActive: {
    fontWeight: "600",
    color: Colors.primary,
  },
  check: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "700",
  },
  empty: {
    fontSize: 15,
    color: Colors.textTertiary,
    textAlign: "center",
    paddingVertical: 20,
  },
  createRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 16,
  },
  createText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
  },
});
