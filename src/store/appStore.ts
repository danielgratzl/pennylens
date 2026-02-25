import { create } from "zustand";

type ViewMode = "combined" | string; // "combined" or a person ID

interface AppState {
  activePortfolioId: string | null;
  viewMode: ViewMode;

  setActivePortfolio: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePortfolioId: null,
  viewMode: "combined",

  setActivePortfolio: (id) => set({ activePortfolioId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
