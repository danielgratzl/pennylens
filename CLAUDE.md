# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run start          # Start Expo dev server
npm run ios            # Start on iOS simulator
npm run android        # Start on Android emulator
npm run db:generate    # Generate Drizzle migrations (after schema changes)
```

**Important:** `npx expo` is broken due to npm hoisting. All scripts use `node node_modules/expo/bin/cli` directly. Always use `npm run` scripts.

**Dependencies:** Use `npm install --legacy-peer-deps` due to React 19 peer conflicts.

No test framework, linter, or formatter is configured.

## Tech Stack

- React Native + Expo SDK 54 (managed workflow, TypeScript)
- expo-sqlite + Drizzle ORM for persistence
- expo-router v6 (file-based routing)
- Zustand for UI-only state
- d3-sankey + react-native-svg (Sankey diagram)
- react-native-gifted-charts (line charts)

## Architecture

### Path Alias

`@/*` maps to `./src/*` (e.g., `import { db } from "@/db"`).

### Database

- **Schema**: Drizzle table definitions in `src/db/schema/`, one file per table. Exported via barrel `src/db/schema/index.ts`.
- **Initialization**: `app/_layout.tsx` runs raw `CREATE TABLE IF NOT EXISTS` SQL (not the Drizzle migrator), then `ALTER TABLE` for newer columns, then `seedDatabase()`.
- **Singleton**: `src/db/index.ts` exports a lazy `db` proxy. `openDatabaseSync` is called with `enableChangeListener: true` to power reactive queries.
- **Pragmas**: WAL journal mode, foreign keys ON.
- **Amounts**: Income/cost amounts stored as **integer cents**. Investment snapshot values stored as **real** (floating point).
- **Temporal versioning**: Income and fixed costs use `effective_from`/`effective_until` (YYYY-MM strings) with `item_group_id` linking versions of the same logical item.
- **Person ownership**: `person_id = NULL` means shared (split equally among all persons in the portfolio).
- **App metadata**: `app_meta` table is a key-value store (schema_version, device_id, base_currency, lastImportDate).

### Data Hooks (`src/hooks/`)

Two patterns coexist in each hook file:

1. **Reactive reads** — exported hooks using `useLiveQuery` from `drizzle-orm/expo-sqlite`:
   ```ts
   export function useIncome(portfolioId: string | null) {
     const { data } = useLiveQuery(query, [portfolioId]);
     return { incomeItems: data ?? [] };
   }
   ```
2. **Mutations** — exported plain async functions (not hooks):
   ```ts
   export async function createIncome(data: {...}) { ... }
   ```

Screens import both the hook and the mutation functions from the same file. `useLiveQuery` auto-updates when underlying data changes (powered by SQLite change listeners).

Detail screens (`[id].tsx`) call `useLiveQuery` directly with `useLocalSearchParams` for the ID rather than using the shared list hook.

### State Management

`src/store/appStore.ts` — single Zustand store for UI state only:
- `activePortfolioId` — currently selected portfolio
- `viewMode` — "combined" or a specific person ID
- `privacyMode` — redacts amounts in UI
- `dbVersion` — incremented on DB import; used as `<Stack key={dbVersion}>` to force full navigator remount

SQLite is the source of truth for all financial data. Zustand holds only transient UI state.

### Routing

- **Root**: `<Stack>` in `app/_layout.tsx` with `key={dbVersion}` for remount on DB import
- **Tabs**: 5 tabs in `app/(tabs)/` — Dashboard, Income, Expenses, Investments, Flow (Sankey)
- **Modals**: All CRUD screens use `presentation: "modal"` and dismiss via `router.back()`
- Tab header shows `<PortfolioPicker>` as title and settings gear icon

### Currency

- All formatting uses `Intl.NumberFormat` with locale `"de-CH"` (Swiss German: apostrophe thousands separator)
- `src/utils/currency.ts`: `formatCents()`, `formatValue()`, `parseCurrencyInput()`
- Base currency stored in `app_meta` (default: CHF)
- `currency` table holds exchange rates relative to base currency
- Investment snapshots store both native `value` and converted `baseValue`

### Month Handling

`src/utils/month.ts` — `YearMonth` is a `"YYYY-MM"` string type, compared lexicographically. `displayMonth()` formats for display using `en-US` locale.
