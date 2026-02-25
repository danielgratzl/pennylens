import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Alert,
} from "react-native";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db";
import { category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/utils/uuid";
import { Colors } from "@/constants/colors";

type CategoryType = "income" | "fixed_cost" | "investment";

const TYPE_LABELS: Record<CategoryType, string> = {
  income: "Income",
  fixed_cost: "Fixed Costs",
  investment: "Investments",
};

const TYPE_COLORS: Record<CategoryType, string> = {
  income: Colors.income,
  fixed_cost: Colors.expense,
  investment: Colors.investment,
};

export default function CategoriesScreen() {
  const { data: categories } = useLiveQuery(db.select().from(category));

  const [addingType, setAddingType] = useState<CategoryType | null>(null);
  const [newName, setNewName] = useState("");

  const sections = (["income", "fixed_cost", "investment"] as CategoryType[]).map(
    (type) => ({
      type,
      title: TYPE_LABELS[type],
      data: (categories ?? []).filter((c) => c.type === type),
    })
  );

  const handleAdd = async (type: CategoryType) => {
    if (!newName.trim()) return;
    await db.insert(category).values({
      id: generateId(),
      portfolioId: null,
      type,
      name: newName.trim(),
      icon: null,
      color: TYPE_COLORS[type],
    });
    setNewName("");
    setAddingType(null);
  };

  const handleRename = (cat: { id: string; name: string }) => {
    Alert.prompt(
      "Rename Category",
      undefined,
      async (text) => {
        if (text?.trim()) {
          await db
            .update(category)
            .set({ name: text.trim() })
            .where(eq(category.id, cat.id));
        }
      },
      "plain-text",
      cat.name
    );
  };

  const handleDelete = (cat: { id: string; name: string }) => {
    if (cat.name === "Other") return; // Don't allow deleting the default
    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.delete(category).where(eq(category.id, cat.id));
        },
      },
    ]);
  };

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: TYPE_COLORS[section.type] }]}>
            {section.title}
          </Text>
          <TouchableOpacity onPress={() => { setAddingType(section.type); setNewName(""); }}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => handleRename(item)}
          onLongPress={() => handleDelete(item)}
        >
          <View style={[styles.dot, { backgroundColor: item.color ?? Colors.textTertiary }]} />
          <Text style={styles.rowText}>{item.name}</Text>
          {item.name === "Other" && <Text style={styles.defaultBadge}>Default</Text>}
        </TouchableOpacity>
      )}
      renderSectionFooter={({ section }) =>
        addingType === section.type ? (
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Category name"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              onSubmitEditing={() => handleAdd(section.type)}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleAdd(section.type)}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddingType(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
      contentContainerStyle={styles.content}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
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
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rowText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  defaultBadge: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
