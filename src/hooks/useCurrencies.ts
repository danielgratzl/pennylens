import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";
import { db } from "@/db";
import { currency, appMeta, investmentAccount } from "@/db/schema";
import { eq } from "drizzle-orm";

export function useBaseCurrency(): string {
  const { data } = useLiveQuery(
    db.select().from(appMeta).where(eq(appMeta.key, "base_currency"))
  );
  return data?.[0]?.value ?? "CHF";
}

export function useCurrencies() {
  const { data } = useLiveQuery(db.select().from(currency));
  return { currencies: data ?? [] };
}

export function useCurrencyRates(): Map<string, number> {
  const baseCurrency = useBaseCurrency();
  const { currencies } = useCurrencies();

  return useMemo(() => {
    const rates = new Map<string, number>();
    rates.set(baseCurrency, 1.0);
    for (const c of currencies) {
      rates.set(c.code, c.rate);
    }
    return rates;
  }, [baseCurrency, currencies]);
}

export async function setBaseCurrency(code: string) {
  await db
    .insert(appMeta)
    .values({ key: "base_currency", value: code })
    .onConflictDoUpdate({ target: appMeta.key, set: { value: code } });
}

export async function addCurrency(code: string, name: string, rate: number) {
  await db.insert(currency).values({ code, name, rate });
}

export async function updateCurrencyRate(code: string, rate: number) {
  await db.update(currency).set({ rate }).where(eq(currency.code, code));
}

export async function deleteCurrency(code: string) {
  // Check if any investment accounts reference this currency
  const accounts = await db
    .select({ id: investmentAccount.id })
    .from(investmentAccount)
    .where(eq(investmentAccount.currency, code));

  if (accounts.length > 0) {
    throw new Error(`Cannot delete ${code}: ${accounts.length} investment account(s) still use it`);
  }

  await db.delete(currency).where(eq(currency.code, code));
}
