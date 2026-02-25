import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/colors";
import { useAppStore } from "@/store/appStore";
import { exportDatabase, importDatabase, saveImportTimestamp, useLastImportDate } from "@/utils/sync";

export default function SettingsScreen() {
  const { activePortfolioId, bumpDbVersion } = useAppStore();
  const [busy, setBusy] = useState(false);
  const lastImportDate = useLastImportDate();

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportDatabase();
    } catch (e: any) {
      Alert.alert("Export Error", e.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const handleImport = () => {
    Alert.alert(
      "Import Database",
      "This will replace ALL current data with the imported file. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              const ok = await importDatabase();
              if (ok) {
                // DB was replaced — reopen and save timestamp before remounting
                await saveImportTimestamp();
                bumpDbVersion();
              }
            } catch (e: any) {
              Alert.alert("Import Error", e.message ?? "Unknown error");
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {busy && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Data</Text>

      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push("/settings/categories")}
      >
        <Ionicons name="pricetags-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.rowText}>Categories</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      {activePortfolioId && (
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push(`/portfolio/${activePortfolioId}/settings`)
          }
        >
          <Ionicons name="briefcase-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.rowText}>Portfolio Settings</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.row} onPress={handleExport} disabled={busy}>
        <Ionicons name="download-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.rowText}>Export Database</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={handleImport} disabled={busy}>
        <Ionicons name="push-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.rowText}>Import Database</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      {lastImportDate && (
        <Text style={styles.hintText}>
          Last imported: {new Date(lastImportDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>About</Text>

      <View style={styles.row}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.rowText}>Version</Text>
        <Text style={styles.versionText}>
          {Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    gap: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  versionText: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
    marginBottom: 4,
    marginLeft: 4,
  },
});
