import { PHAROS_EXPLORER_API, DEFAULT_DAYS } from "../utils/config.js";

export async function fetchTransactions(walletAddress, days = DEFAULT_DAYS) {
  const lookbackDays = typeof days === "number" && days > 0 ? days : DEFAULT_DAYS;
  const now = Date.now();
  const sinceTimestamp = Math.floor(now / 1000) - lookbackDays * 24 * 60 * 60;

  const url = `${PHAROS_EXPLORER_API}/transactions?address=${encodeURIComponent(walletAddress)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Explorer API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const transactions = Array.isArray(data?.transactions) ? data.transactions : data;

    return transactions
      .filter((tx) => {
        const timestamp = Number(tx.timestamp) || 0;
        return timestamp >= sinceTimestamp;
      })
      .map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        timestamp: tx.timestamp,
        input: tx.input,
        status: tx.status,
      }));
  } catch (error) {
    console.error(`Failed to fetch transactions for ${walletAddress}:`, error);
    return [];
  }
}
