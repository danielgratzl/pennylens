import { useIncome } from "./useIncome";
import { useCosts } from "./useCosts";
import { usePersons } from "./usePersons";
import { useMonthlySummary } from "./useMonthlySummary";

interface SankeyNode {
  id: string;
  name: string;
  color: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export function useSankeyData(
  portfolioId: string | null,
  viewMode: string
): SankeyData {
  const { incomeItems } = useIncome(portfolioId);
  const { costItems } = useCosts(portfolioId);
  const { persons } = usePersons(portfolioId);
  const summary = useMonthlySummary(portfolioId, viewMode);

  const isPersonView = viewMode !== "combined";
  const personCount = Math.max(persons.length, 1);

  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  const nodeSet = new Set<string>();

  function addNode(id: string, name: string, color: string) {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, name, color });
    }
  }

  // Central "Budget" node
  addNode("budget", "Budget", "#6366F1");

  // Income sources -> Budget
  for (const item of incomeItems) {
    let monthly = item.income.isYearly
      ? Math.round(item.income.amount / 12)
      : item.income.amount;

    if (isPersonView) {
      if (item.income.personId === viewMode) {
        // belongs to this person, use full amount
      } else if (item.income.personId === null) {
        monthly = Math.round(monthly / personCount);
      } else {
        continue; // belongs to another person
      }
    }

    if (monthly <= 0) continue;

    const nodeId = `income-${item.income.id}`;
    const color = item.category?.color ?? "#4CAF50";
    addNode(nodeId, item.income.name, color);
    links.push({ source: nodeId, target: "budget", value: monthly });
  }

  // Budget -> Cost categories (aggregated)
  const categoryTotals = new Map<string, { name: string; color: string; total: number }>();
  for (const item of costItems) {
    let monthly = item.cost.isYearly
      ? Math.round(item.cost.amount / 12)
      : item.cost.amount;

    if (isPersonView) {
      if (item.cost.personId === viewMode) {
        // belongs to this person
      } else if (item.cost.personId === null) {
        monthly = Math.round(monthly / personCount);
      } else {
        continue;
      }
    }

    if (monthly <= 0) continue;

    const catId = item.category?.id ?? "uncategorized";
    const catName = item.category?.name ?? "Uncategorized";
    const catColor = item.category?.color ?? "#F44336";
    const existing = categoryTotals.get(catId);
    if (existing) {
      existing.total += monthly;
    } else {
      categoryTotals.set(catId, { name: catName, color: catColor, total: monthly });
    }
  }

  for (const [catId, cat] of categoryTotals) {
    const nodeId = `cost-cat-${catId}`;
    addNode(nodeId, cat.name, cat.color);
    links.push({ source: "budget", target: nodeId, value: cat.total });
  }

  // Budget -> Untracked (remainder)
  if (summary.untracked > 0) {
    addNode("untracked", "Untracked", "#94A3B8");
    links.push({ source: "budget", target: "untracked", value: summary.untracked });
  }

  return { nodes, links };
}
