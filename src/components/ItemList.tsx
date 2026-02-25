import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { formatCents } from "@/utils/currency";

interface ItemRow {
  id: string;
  name: string;
  amount: number;
  isYearly: boolean;
  currency: string;
  personName: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

interface ItemListProps {
  items: ItemRow[];
  onPress?: (id: string) => void;
  emptyMessage?: string;
}

export function ItemList({ items, onPress, emptyMessage = "No items yet" }: ItemListProps) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <Animated.View
          entering={index < 10 ? FadeInDown.delay(index * 50).duration(300) : undefined}
        >
          <TouchableOpacity
            style={styles.row}
            onPress={() => onPress?.(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              {item.categoryColor && (
                <View style={[styles.dot, { backgroundColor: item.categoryColor }]} />
              )}
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.categoryName ?? "Uncategorized"}
                  {item.personName ? ` · ${item.personName}` : " · Shared"}
                </Text>
              </View>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.amount}>
                {formatCents(item.isYearly ? Math.round(item.amount / 12) : item.amount, item.currency)}
              </Text>
              {item.isYearly && <Text style={styles.yearly}>/mo (yearly)</Text>}
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  meta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  yearly: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
});
