// MOCK DATA: UI-only fake data for the portfolio balance card on the dashboard.
// Replace this with real balance and profitability data from the AIMM vault / wallet when wiring production.

export interface PortfolioBalance {
  /** Total balance in USD */
  totalBalance: number;
  /** Profit/loss amount in USD */
  profitLoss: number;
  /** Profit/loss percentage */
  profitLossPercentage: number;
  /** Whether the portfolio is profitable (positive P/L) */
  isProfitable: boolean;
}

/**
 * MOCK DATA: UI-only fake data for the portfolio balance.
 *
 * In production, this will be replaced by real-time data from the AIMM vault,
 * wallet balance, and position tracking system.
 */
export const mockPortfolioBalance: PortfolioBalance = {
  totalBalance: 47823.45,
  profitLoss: 5234.12,
  profitLossPercentage: 12.3,
  isProfitable: true,
};

/**
 * Format a number as USD currency with appropriate decimals.
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

