import { ETH_TO_USD_RATE, NATIVE_TOKEN_SYMBOL } from "../utils/config.js";

export function calculateGasSpent(transactions, walletAddress) {
  // Normalize wallet address to lowercase for consistent comparison
  const normalizedWallet = (walletAddress || "").toLowerCase();

  // Filter to only outgoing transactions (where user initiated the tx)
  const outgoing = transactions.filter((tx) => {
    const from = (tx.from || "").toLowerCase();
    return from === normalizedWallet;
  });

  // Calculate total gas spent in native tokens
  let totalGasSpent = 0;

  outgoing.forEach((tx) => {
    const gasUsed = Number(tx.gasUsed) || 0;
    const gasPrice = Number(tx.gasPrice) || 0;
    // Gas cost = (gasUsed * gasPrice) / 1e18 (converts to native token units)
    const gasCost = (gasUsed * gasPrice) / 1e18;
    totalGasSpent += gasCost;
  });

  // Round native to 6 decimal places
  const nativeRounded = Math.round(totalGasSpent * 1e6) / 1e6;

  // Convert to USD and round to 2 decimal places
  const usdEstimate = Math.round(totalGasSpent * ETH_TO_USD_RATE * 100) / 100;

  return {
    native: nativeRounded,
    symbol: NATIVE_TOKEN_SYMBOL,
    usdEstimate,
  };
}
