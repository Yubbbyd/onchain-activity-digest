import { labelAddress } from "../utils/addressLabel.js";
import { formatSummary } from "./summary.js";

export function formatDetailed(walletAddress, period, categorized, gasSpent, highlights, days) {
  // Calculate total transactions
  const totalTransactions =
    (categorized.sent?.length || 0) +
    (categorized.received?.length || 0) +
    (categorized.contractCalls?.length || 0) +
    (categorized.tokensSent?.length || 0) +
    (categorized.tokensReceived?.length || 0);

  // Aggregate tokens received by symbol and counterparty
  const tokensReceivedAgg = aggregateTokenTransfers(categorized.tokensReceived || []);

  // Aggregate tokens sent by symbol and counterparty
  const tokensSentAgg = aggregateTokenTransfers(categorized.tokensSent || [], "to");

  // Native token received transactions
  const nativeReceived = (categorized.received || []).map((tx) => ({
    amount: tx.value,
    from: tx.from,
    txHash: tx.hash,
  }));

  // Native token sent transactions
  const nativeSent = (categorized.sent || []).map((tx) => ({
    amount: tx.value,
    to: tx.to,
    txHash: tx.hash,
  }));

  // Build contracts interacted with (unique by address)
  const contractsMap = new Map();
  (categorized.contractCalls || []).forEach((tx) => {
    const address = (tx.to || "").toLowerCase();
    if (address && address.length > 0) {
      if (!contractsMap.has(address)) {
        contractsMap.set(address, { address, callCount: 0, firstTime: true });
      }
      const entry = contractsMap.get(address);
      entry.callCount += 1;
    }
  });

  const contractsInteracted = Array.from(contractsMap.values()).map((entry) => ({
    address: entry.address,
    label: labelAddress(entry.address),
    callCount: entry.callCount,
    firstTime: entry.callCount === 1,
  }));

  // Build the narrative using formatSummary
  const narrative = formatSummary(walletAddress, categorized, gasSpent, highlights, days);

  // Construct the detailed report
  return {
    wallet: walletAddress,
    period,
    total_transactions: totalTransactions,
    tokens_received: tokensReceivedAgg,
    tokens_sent: tokensSentAgg,
    native_received: nativeReceived,
    native_sent: nativeSent,
    contracts_interacted: contractsInteracted,
    gas_spent: gasSpent,
    highlights,
    narrative,
  };
}

// Helper function to aggregate token transfers
function aggregateTokenTransfers(transfers, counterpartyKey = "from") {
  const aggregated = new Map();

  transfers.forEach((transfer) => {
    const key = `${transfer.tokenSymbol}_${transfer[counterpartyKey]}`;
    if (!aggregated.has(key)) {
      aggregated.set(key, {
        token: transfer.tokenSymbol,
        amount: "0",
        [counterpartyKey]: transfer[counterpartyKey],
        txCount: 0,
      });
    }

    const entry = aggregated.get(key);
    entry.amount = (parseFloat(entry.amount) + parseFloat(transfer.formattedValue || "0")).toString();
    entry.txCount += 1;
  });

  return Array.from(aggregated.values());
}
