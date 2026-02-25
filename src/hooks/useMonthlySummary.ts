import { useIncomeForMonth } from "./useIncomeForMonth";
import { useCostsForMonth } from "./useCostsForMonth";
import { usePersons } from "./usePersons";
import { type YearMonth } from "@/utils/month";

interface MonthlySummary {
  totalIncome: number;
  totalCosts: number;
  untracked: number;
}

export function useMonthlySummary(
  portfolioId: string | null,
  month: YearMonth,
  viewMode: string
): MonthlySummary {
  const { incomeItems } = useIncomeForMonth(portfolioId, month);
  const { costItems } = useCostsForMonth(portfolioId, month);
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
      // Person view: include items assigned to this person, plus their share of shared items
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
