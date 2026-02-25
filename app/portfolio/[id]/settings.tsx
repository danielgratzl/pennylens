import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { portfolio, person } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { updatePortfolio, deletePortfolio } from "@/hooks/usePortfolios";
import { createPerson, updatePerson, deletePerson } from "@/hooks/usePersons";
import { useAppStore } from "@/store/appStore";
import { Colors, PersonColors } from "@/constants/colors";

export default function PortfolioSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setActivePortfolio } = useAppStore();

  const { data: portfolioData } = useLiveQuery(
    db.select().from(portfolio).where(eq(portfolio.id, id ?? "")),
    [id]
  );
  const { data: persons } = useLiveQuery(
    db
      .select()
      .from(person)
      .where(eq(person.portfolioId, id ?? ""))
      .orderBy(asc(person.sortOrder)),
    [id]
  );

  const currentPortfolio = portfolioData?.[0];
  const [name, setName] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize name from DB once loaded
  if (currentPortfolio && !initialized) {
    setName(currentPortfolio.name);
    setInitialized(true);
  }

  const handleRename = async () => {
    if (!id || !name.trim()) return;
    try {
      await updatePortfolio(id, { name: name.trim() });
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to rename portfolio");
    }
  };

  const handleDeletePortfolio = () => {
    Alert.alert(
      "Delete Portfolio",
      "This will permanently delete this portfolio and ALL its data (income, costs, investments, persons). This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePortfolio(id!);
              setActivePortfolio(null);
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Failed to delete portfolio");
            }
          },
        },
      ]
    );
  };

  const handleAddPerson = async () => {
    if (!id || !newPersonName.trim()) return;
    try {
      const nextColor = PersonColors[(persons?.length ?? 0) % PersonColors.length];
      await createPerson(id, newPersonName.trim(), nextColor, persons?.length ?? 0);
      setNewPersonName("");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to add person");
    }
  };

  const handleRenamePerson = (p: { id: string; name: string }) => {
    Alert.prompt("Rename Person", undefined, async (text) => {
      if (text?.trim()) {
        try {
          await updatePerson(p.id, { name: text.trim() });
        } catch (e: any) {
          Alert.alert("Error", e.message ?? "Failed to rename person");
        }
      }
    }, "plain-text", p.name);
  };

  const handleDeletePerson = (p: { id: string; name: string }) => {
    Alert.alert("Delete Person", `Delete "${p.name}"? Income, costs, and investments assigned to this person will lose their person assignment.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePerson(p.id);
          } catch (e: any) {
            Alert.alert("Error", e.message ?? "Failed to delete person");
          }
        },
      },
    ]);
  };

  if (!currentPortfolio) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Portfolio not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Rename Portfolio</Text>
      <View style={styles.renameRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Portfolio name"
          placeholderTextColor={Colors.textTertiary}
        />
        <TouchableOpacity
          style={[styles.saveButton, !name.trim() && styles.buttonDisabled]}
          onPress={handleRename}
          disabled={!name.trim()}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Persons</Text>
      {(persons ?? []).map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.personRow}
          onPress={() => handleRenamePerson(p)}
          onLongPress={() => handleDeletePerson(p)}
        >
          <View style={[styles.colorDot, { backgroundColor: p.color }]} />
          <Text style={styles.personName}>{p.name}</Text>
          <Text style={styles.hintText}>Tap to rename</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.addPersonRow}>
        <TextInput
          style={styles.addPersonInput}
          value={newPersonName}
          onChangeText={setNewPersonName}
          placeholder="New person name"
          placeholderTextColor={Colors.textTertiary}
          onSubmitEditing={handleAddPerson}
        />
        <TouchableOpacity
          style={[styles.addButton, !newPersonName.trim() && styles.buttonDisabled]}
          onPress={handleAddPerson}
          disabled={!newPersonName.trim()}
        >
          <Text style={styles.saveText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Danger Zone</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePortfolio}>
        <Text style={styles.deleteText}>Delete Portfolio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  renameRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
  },
  saveText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: { opacity: 0.5 },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    gap: 12,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  personName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  hintText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  addPersonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  addPersonInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
});
