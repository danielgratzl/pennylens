import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";
import { db } from "@/db";
import { investmentAccount, accountSnapshot, person, category } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { generateId } from "@/utils/uuid";
import { type YearMonth } from "@/utils/month";

export function useInvestmentAccounts(portfolioId: string | null) {
  const { data } = useLiveQuery(
    db
      .select({
        account: investmentAccount,
        person: person,
        category: category,
      })
      .from(investmentAccount)
      .leftJoin(person, eq(investmentAccount.personId, person.id))
      .leftJoin(category, eq(investmentAccount.categoryId, category.id))
      .where(portfolioId ? eq(investmentAccount.portfolioId, portfolioId) : undefined),
    [portfolioId]
  );

  return { accounts: data ?? [] };
}

export function useInvestmentTotal(portfolioId: string | null, viewMode: string = "combined", personCount: number = 1, currencyRates?: Map<string, number>) {
  const { data: allSnapshots } = useLiveQuery(
    db
      .select({
        accountId: accountSnapshot.accountId,
        snapshotMonth: accountSnapshot.snapshotMonth,
        value: accountSnapshot.value,
        personId: investmentAccount.personId,
        currency: investmentAccount.currency,
      })
      .from(accountSnapshot)
      .innerJoin(investmentAccount, eq(accountSnapshot.accountId, investmentAccount.id))
      .where(portfolioId ? eq(investmentAccount.portfolioId, portfolioId) : undefined),
    [portfolioId]
  );

  const total = useMemo(() => {
    const snapshots = allSnapshots ?? [];
    // Find latest snapshot per account
    const latestMonth = new Map<string, string>();
    const latestValue = new Map<string, number>();
    const accountPerson = new Map<string, string | null>();
    const accountCurrency = new Map<string, string>();
    for (const s of snapshots) {
      accountPerson.set(s.accountId, s.personId);
      accountCurrency.set(s.accountId, s.currency);
      const cur = latestMonth.get(s.accountId);
      if (!cur || s.snapshotMonth > cur) {
        latestMonth.set(s.accountId, s.snapshotMonth);
        latestValue.set(s.accountId, s.value);
      }
    }
    let sum = 0;
    for (const [accountId, value] of latestValue) {
      const pid = accountPerson.get(accountId);
      const cur = accountCurrency.get(accountId) ?? "CHF";
      const rate = currencyRates?.get(cur) ?? 1;
      const converted = value * rate;
      if (viewMode === "combined") {
        sum += converted;
      } else if (pid === viewMode) {
        sum += converted;
      } else if (pid === null && personCount > 0) {
        sum += converted / personCount;
      }
    }
    return sum;
  }, [allSnapshots, viewMode, personCount, currencyRates]);

  return { total };
}

export function useInvestmentHistory(portfolioId: string | null, viewMode: string = "combined", personCount: number = 1, currencyRates?: Map<string, number>) {
  const { data: allSnapshots } = useLiveQuery(
    db
      .select({
        accountId: accountSnapshot.accountId,
        snapshotMonth: accountSnapshot.snapshotMonth,
        value: accountSnapshot.value,
        personId: investmentAccount.personId,
        currency: investmentAccount.currency,
      })
      .from(accountSnapshot)
      .innerJoin(investmentAccount, eq(accountSnapshot.accountId, investmentAccount.id))
      .where(portfolioId ? eq(investmentAccount.portfolioId, portfolioId) : undefined),
    [portfolioId]
  );

  const history = useMemo(() => {
    const snapshots = allSnapshots ?? [];
    if (snapshots.length === 0) return [];

    // Build person and currency mapping per account
    const accountPerson = new Map<string, string | null>();
    const accountCurrency = new Map<string, string>();
    for (const s of snapshots) {
      accountPerson.set(s.accountId, s.personId);
      accountCurrency.set(s.accountId, s.currency);
    }

    // Filter accounts based on viewMode
    const relevantSnapshots = viewMode === "combined"
      ? snapshots
      : snapshots.filter((s) => {
          const pid = accountPerson.get(s.accountId);
          return pid === viewMode || pid === null;
        });

    if (relevantSnapshots.length === 0) return [];

    // Group by month, summing across all accounts
    // For months where an account has no snapshot, carry forward its last known value
    const accountMonths = new Map<string, Map<string, number>>();
    const allMonths = new Set<string>();

    for (const s of relevantSnapshots) {
      allMonths.add(s.snapshotMonth);
      let monthMap = accountMonths.get(s.accountId);
      if (!monthMap) {
        monthMap = new Map();
        accountMonths.set(s.accountId, monthMap);
      }
      monthMap.set(s.snapshotMonth, s.value);
    }

    const sortedMonths = [...allMonths].sort();
    const result: { snapshotMonth: string; value: number }[] = [];

    for (const month of sortedMonths) {
      let total = 0;
      for (const [accountId, monthMap] of accountMonths) {
        const pid = accountPerson.get(accountId);
        const isShared = pid === null;
        const cur = accountCurrency.get(accountId) ?? "CHF";
        const rate = currencyRates?.get(cur) ?? 1;
        // Find the latest value at or before this month
        let val = 0;
        for (const m of sortedMonths) {
          if (m > month) break;
          const v = monthMap.get(m);
          if (v !== undefined) val = v;
        }
        if (isShared && viewMode !== "combined" && personCount > 0) {
          val = val / personCount;
        }
        total += val * rate;
      }
      result.push({ snapshotMonth: month, value: total });
    }

    return result;
  }, [allSnapshots, viewMode, personCount, currencyRates]);

  return { history };
}

export function useSnapshots(accountId: string) {
  const { data } = useLiveQuery(
    db
      .select()
      .from(accountSnapshot)
      .where(eq(accountSnapshot.accountId, accountId))
      .orderBy(desc(accountSnapshot.snapshotMonth)),
    [accountId]
  );

  return { snapshots: data ?? [] };
}

export async function createInvestmentAccount(data: {
  portfolioId: string;
  personId: string | null;
  categoryId: string | null;
  name: string;
  accountType?: string;
  institution?: string;
  currency?: string;
}) {
  const id = generateId();
  await db.insert(investmentAccount).values({
    id,
    portfolioId: data.portfolioId,
    personId: data.personId ?? null,
    categoryId: data.categoryId ?? null,
    name: data.name,
    accountType: data.accountType ?? null,
    institution: data.institution ?? null,
    currency: data.currency ?? "CHF",
  });
  return id;
}

export async function addSnapshot(accountId: string, month: YearMonth, value: number) {
  const id = generateId();
  await db.insert(accountSnapshot).values({ id, accountId, snapshotMonth: month, value });
  return id;
}

export async function deleteInvestmentAccount(id: string) {
  await db.delete(accountSnapshot).where(eq(accountSnapshot.accountId, id));
  await db.delete(investmentAccount).where(eq(investmentAccount.id, id));
}

export async function deleteSnapshot(id: string) {
  await db.delete(accountSnapshot).where(eq(accountSnapshot.id, id));
}
