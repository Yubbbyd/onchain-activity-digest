export function formatSummary(walletAddress, categorized, gasSpent, highlights, days) {
  // Shorten wallet address to first 6 + last 4 characters
  const shortAddress =
    walletAddress && walletAddress.length > 10
      ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
      : walletAddress;

  // Calculate total transactions
  const totalTransactions =
    (categorized.sent?.length || 0) +
    (categorized.received?.length || 0) +
    (categorized.contractCalls?.length || 0) +
    (categorized.tokensSent?.length || 0) +
    (categorized.tokensReceived?.length || 0);

  // Get top 2 tokens sent and received by formatted value
  const topTokensSent = (categorized.tokensSent || [])
    .sort((a, b) => parseFloat(b.formattedValue || "0") - parseFloat(a.formattedValue || "0"))
    .slice(0, 2);

  const topTokensReceived = (categorized.tokensReceived || [])
    .sort((a, b) => parseFloat(b.formattedValue || "0") - parseFloat(a.formattedValue || "0"))
    .slice(0, 2);

  // Count unique contracts interacted with
  const uniqueContracts = new Set((categorized.contractCalls || []).map((tx) => tx.to?.toLowerCase())).size;

  // Build the narrative
  let narrative = `Wallet ${shortAddress} recorded ${totalTransactions} transaction${totalTransactions !== 1 ? "s" : ""} over the last ${days} day${days !== 1 ? "s" : ""}. `;

  // Token activity
  const tokenActivity = [];
  if (topTokensSent.length > 0) {
    tokenActivity.push(
      `sent ${topTokensSent.map((t) => `${t.formattedValue} ${t.tokenSymbol}`).join(" and ")}`
    );
  }
  if (topTokensReceived.length > 0) {
    tokenActivity.push(
      `received ${topTokensReceived.map((t) => `${t.formattedValue} ${t.tokenSymbol}`).join(" and ")}`
    );
  }
  if (tokenActivity.length > 0) {
    narrative += `Token transfers: ${tokenActivity.join(", ")}. `;
  }

  // Contract interactions and gas costs
  narrative += `${uniqueContracts} unique contract${uniqueContracts !== 1 ? "s" : ""} were interacted with, consuming ${gasSpent.native} ${gasSpent.symbol} (~$${gasSpent.usdEstimate} USD) in gas fees. `;

  // Primary highlight
  const primaryHighlight = highlights && highlights.length > 0 ? highlights[0] : null;
  if (primaryHighlight) {
    narrative += primaryHighlight;
  }

  return narrative;
}
