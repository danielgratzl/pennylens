import { useIncome } from "./useIncome";
import { useCosts } from "./useCosts";
import { usePersons } from "./usePersons";

interface MonthlySummary {
  totalIncome: number;
  totalCosts: number;
  untracked: number;
}

export function useMonthlySummary(
  portfolioId: string | null,
  viewMode: string
): MonthlySummary {
  const { incomeItems } = useIncome(portfolioId);
  const { costItems } = useCosts(portfolioId);
  const { persons } = usePersons(portfolioId);

  const personCount = Math.max(persons.length, 1);
  const isPersonView = viewMode !== "combined";

  function getMonthlyAmount(amount: number, isYearly: boolean): number {
    return isYearly ? Math.round(amount / 12) : amount;
  }

  let totalIncome = 0;
  let totalCosts = 0;

  for (const item of incomeItems) {
    const monthly = getMonthlyAmount(item.income.amount, item.income.isYearly);

    if (isPersonView) {
      if (item.income.personId === viewMode) {
        totalIncome += monthly;
      } else if (item.income.personId === null) {
        totalIncome += Math.round(monthly / personCount);
      }
    } else {
      totalIncome += monthly;
    }
  }

  for (const item of costItems) {
    const monthly = getMonthlyAmount(item.cost.amount, item.cost.isYearly);

    if (isPersonView) {
      if (item.cost.personId === viewMode) {
        totalCosts += monthly;
      } else if (item.cost.personId === null) {
        totalCosts += Math.round(monthly / personCount);
      }
    } else {
      totalCosts += monthly;
    }
  }

  const untracked = totalIncome - totalCosts;

  return { totalIncome, totalCosts, untracked };
}
