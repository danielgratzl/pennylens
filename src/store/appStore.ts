import { create } from "zustand";

type ViewMode = "combined" | string; // "combined" or a person ID

interface AppState {
  activePortfolioId: string | null;
  viewMode: ViewMode;
  dbVersion: number;

  setActivePortfolio: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  bumpDbVersion: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePortfolioId: null,
  viewMode: "combined",
  dbVersion: 0,

  setActivePortfolio: (id) => set({ activePortfolioId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  bumpDbVersion: () =>
    set((s) => ({ dbVersion: s.dbVersion + 1, activePortfolioId: null })),
}));
