import { useEffect, useState, Suspense } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { getExpoDb, getDb } from "@/db";
import { seedDatabase } from "@/db/seed";

function useMigrations() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const expoDb = getExpoDb();

        // Run migration SQL directly (simpler than drizzle-orm/migrator for expo)
        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS "portfolio" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "description" text,
            "archived" integer DEFAULT false NOT NULL,
            "created_at" text NOT NULL
          );
        `);
        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS "person" (
            "id" text PRIMARY KEY NOT NULL,
            "portfolio_id" text NOT NULL,
            "name" text NOT NULL,
            "color" text NOT NULL,
            "sort_order" integer DEFAULT 0 NOT NULL,
            FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON UPDATE no action ON DELETE no action
          );
        `);
        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS "category" (
            "id" text PRIMARY KEY NOT NULL,
            "portfolio_id" text,
            "type" text NOT NULL,
            "name" text NOT NULL,
            "icon" text,
            "color" text,
            FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON UPDATE no action ON DELETE no action
          );
        `);
        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS "income" (
            "id" text PRIMARY KEY NOT NULL,
            "item_group_id" text NOT NULL,
            "portfolio_id" text NOT NULL,
            "person_id" text,
            "category_id" text,
            "name" text NOT NULL,
            "amount" integer NOT NULL,
            "is_yearly" integer DEFAULT false NOT NULL,
            "currency" text DEFAULT 'CHF' NOT NULL,
            "effective_from" text NOT NULL,
            "effective_until" text,
            FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("person_id") REFERENCES "person"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("category_id") REFERENCES "category"("id") ON UPDATE no action ON DELETE no action
          );
        `);
        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS "fixed_cost" (
            "id" text PRIMARY KEY NOT NULL,
            "item_group_id" text NOT NULL,
            "portfolio_id" text NOT NULL,
            "person_id" text,
            "category_id" text,
            "name" text NOT NULL,
            "amount" integer NOT NULL,
            "is_yearly" integer DEFAULT false NOT NULL,
            "currency" text DEFAULT 'CHF' NOT NULL,
            "effective_from" text NOT NULL,
            "effective_until" text,
            FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("person_id") REFERENCES "person"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("category_id") REFERENCES "category"("id") ON UPDATE no action ON DELETE no action
          );
        `);
        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS "investment_account" (
            "id" text PRIMARY KEY NOT NULL,
            "portfolio_id" text NOT NULL,
            "person_id" text,
            "category_id" text,
            "name" text NOT NULL,
            "account_type" text,
            "institution" text,
            FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("person_id") REFERENCES "person"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("category_id") REFERENCES "category"("id") ON UPDATE no action ON DELETE no action
          );
        `);
        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS "account_snapshot" (
            "id" text PRIMARY KEY NOT NULL,
            "account_id" text NOT NULL,
            "snapshot_month" text NOT NULL,
            "value" real NOT NULL,
            FOREIGN KEY ("account_id") REFERENCES "investment_account"("id") ON UPDATE no action ON DELETE no action
          );
        `);
        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS "app_meta" (
            "key" text PRIMARY KEY NOT NULL,
            "value" text
          );
        `);

        // Seed default data
        await seedDatabase();

        setReady(true);
      } catch (e: any) {
        console.error("DB init error:", e);
        setError(e.message ?? "Unknown error");
      }
    }

    init();
  }, []);

  return { ready, error };
}

export default function RootLayout() {
  const { ready, error } = useMigrations();

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Database Error</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="income/create"
          options={{ title: "Add Income", presentation: "modal" }}
        />
        <Stack.Screen
          name="income/[groupId]"
          options={{ title: "Income Details", presentation: "modal" }}
        />
        <Stack.Screen
          name="cost/create"
          options={{ title: "Add Fixed Cost", presentation: "modal" }}
        />
        <Stack.Screen
          name="cost/[groupId]"
          options={{ title: "Cost Details", presentation: "modal" }}
        />
        <Stack.Screen
          name="investment/create"
          options={{ title: "Add Investment Account", presentation: "modal" }}
        />
        <Stack.Screen
          name="investment/[id]"
          options={{ title: "Account Details", presentation: "modal" }}
        />
        <Stack.Screen
          name="investment/snapshot/create"
          options={{ title: "Record Snapshot", presentation: "modal" }}
        />
        <Stack.Screen
          name="portfolio/create"
          options={{ title: "New Portfolio", presentation: "modal" }}
        />
        <Stack.Screen
          name="portfolio/[id]/settings"
          options={{ title: "Portfolio Settings", presentation: "modal" }}
        />
        <Stack.Screen
          name="settings/index"
          options={{ title: "Settings", presentation: "modal" }}
        />
        <Stack.Screen
          name="settings/categories"
          options={{ title: "Categories", presentation: "modal" }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.danger,
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
