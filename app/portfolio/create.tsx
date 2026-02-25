import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { createPortfolio } from "@/hooks/usePortfolios";
import { createPerson } from "@/hooks/usePersons";
import { useAppStore } from "@/store/appStore";
import { Colors } from "@/constants/colors";

const PERSON_COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

export default function CreatePortfolioScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [persons, setPersons] = useState<{ name: string; color: string }[]>([
    { name: "", color: PERSON_COLORS[0] },
  ]);
  const { setActivePortfolio } = useAppStore();

  const addPerson = () => {
    setPersons([...persons, { name: "", color: PERSON_COLORS[persons.length % PERSON_COLORS.length] }]);
  };

  const updatePersonName = (index: number, value: string) => {
    const updated = [...persons];
    updated[index].name = value;
    setPersons(updated);
  };

  const removePerson = (index: number) => {
    if (persons.length <= 1) return;
    setPersons(persons.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    const portfolioId = await createPortfolio(name.trim(), description.trim() || undefined);

    for (let i = 0; i < persons.length; i++) {
      const p = persons[i];
      if (p.name.trim()) {
        await createPerson(portfolioId, p.name.trim(), p.color, i);
      }
    }

    setActivePortfolio(portfolioId);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Portfolio Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Our Household"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Brief description"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={styles.label}>Persons</Text>
      {persons.map((p, i) => (
        <View key={i} style={styles.personRow}>
          <View style={[styles.colorDot, { backgroundColor: p.color }]} />
          <TextInput
            style={styles.personInput}
            value={p.name}
            onChangeText={(v) => updatePersonName(i, v)}
            placeholder={`Person ${i + 1}`}
            placeholderTextColor={Colors.textTertiary}
          />
          {persons.length > 1 && (
            <TouchableOpacity onPress={() => removePerson(i)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity onPress={addPerson} style={styles.addPersonButton}>
        <Text style={styles.addPersonText}>+ Add Person</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Create Portfolio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  personInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeText: {
    color: Colors.danger,
    fontSize: 14,
  },
  addPersonButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  addPersonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
