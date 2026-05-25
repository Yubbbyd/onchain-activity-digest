import { PHAROS_EXPLORER_API, DEFAULT_DAYS } from "../utils/config.js";

export async function fetchTokenTransfers(walletAddress, days = DEFAULT_DAYS) {
  const lookbackDays = typeof days === "number" && days > 0 ? days : DEFAULT_DAYS;
  const now = Date.now();
  const sinceTimestamp = Math.floor(now / 1000) - lookbackDays * 24 * 60 * 60;

  const url = `${PHAROS_EXPLORER_API}/tokenTransfers?address=${encodeURIComponent(walletAddress)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Explorer API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const transfers = Array.isArray(data?.transfers) ? data.transfers : data;

    return transfers
      .filter((transfer) => {
        const timestamp = Number(transfer.timestamp) || 0;
        return timestamp >= sinceTimestamp;
      })
      .map((transfer) => {
        const decimals = Number(transfer.tokenDecimal) || 0;
        const rawValue = transfer.value || "0";
        const formattedValue = formatTokenValue(rawValue, decimals);

        return {
          tokenName: transfer.tokenName,
          tokenSymbol: transfer.tokenSymbol,
          tokenDecimal: decimals,
          from: transfer.from,
          to: transfer.to,
          value: rawValue,
          formattedValue,
          contractAddress: transfer.contractAddress,
          transactionHash: transfer.transactionHash,
          timestamp: transfer.timestamp,
        };
      });
  } catch (error) {
    console.error(`Failed to fetch token transfers for ${walletAddress}:`, error);
    return [];
  }
}

function formatTokenValue(rawValue, decimals) {
  const divisor = Math.pow(10, decimals);
  const numeric = Number(rawValue);
  return (numeric / divisor).toString();
}
