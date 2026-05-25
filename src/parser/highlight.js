export function extractHighlights(categorized, walletAddress) {
  const highlights = [];

  // Total activity count
  const totalTransactions =
    (categorized.sent?.length || 0) +
    (categorized.received?.length || 0) +
    (categorized.contractCalls?.length || 0) +
    (categorized.tokensSent?.length || 0) +
    (categorized.tokensReceived?.length || 0);

  // Check 6: No activity at all
  if (totalTransactions === 0) {
    return ["No onchain activity detected in this period."];
  }

  // Check 1: First-time contract interactions (only 1 call to a contract address)
  const contractCallsByAddress = {};
  (categorized.contractCalls || []).forEach((tx) => {
    const to = (tx.to || "").toLowerCase();
    if (to) {
      contractCallsByAddress[to] = (contractCallsByAddress[to] || 0) + 1;
    }
  });

  Object.entries(contractCallsByAddress).forEach(([address, count]) => {
    if (count === 1) {
      highlights.push(
        `First interaction with contract ${address.substring(0, 6)}...${address.substring(38)}.`
      );
    }
  });

  // Check 4: Contract deployments (where "to" is null or empty)
  const deployments = (categorized.contractCalls || []).filter(
    (tx) => !tx.to || tx.to.trim() === ""
  );
  if (deployments.length > 0) {
    highlights.push(
      `Deployed ${deployments.length} contract${deployments.length > 1 ? "s" : ""} on-chain.`
    );
  }

  // Check 2: Largest single token transfer sent or received
  const allTokenTransfers = [
    ...(categorized.tokensSent || []),
    ...(categorized.tokensReceived || []),
  ];
  if (allTokenTransfers.length > 0) {
    const largestToken = allTokenTransfers.reduce((max, transfer) => {
      const maxValue = parseFloat(max.formattedValue || "0");
      const currentValue = parseFloat(transfer.formattedValue || "0");
      return currentValue > maxValue ? transfer : max;
    });

    highlights.push(
      `Largest token transfer: ${largestToken.formattedValue} ${largestToken.tokenSymbol}.`
    );
  }

  // Check 3: Largest native token transfer sent or received
  const allNativeTransfers = [
    ...(categorized.sent || []),
    ...(categorized.received || []),
  ];
  if (allNativeTransfers.length > 0) {
    const largestNative = allNativeTransfers.reduce((max, tx) => {
      const maxValue = parseFloat(max.value || "0");
      const currentValue = parseFloat(tx.value || "0");
      return currentValue > maxValue ? tx : max;
    });

    highlights.push(
      `Largest native token transfer: ${(largestNative.value / 1e18).toFixed(6)} PTT.`
    );
  }

  // Check 5: High activity (more than 50 total transactions)
  if (totalTransactions > 50) {
    highlights.push(`High activity week: ${totalTransactions} total transactions.`);
  }

  return highlights;
}
