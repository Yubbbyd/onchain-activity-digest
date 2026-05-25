import { filterByTimeRange } from "../utils/timeFilter.js";

export function categorizeTransactions(transactions, tokenTransfers, walletAddress) {
  // Normalize the wallet address to lowercase for consistent comparison
  const normalizedWallet = (walletAddress || "").toLowerCase();

  const result = {
    // Outgoing native token transfers: user initiated the transaction and it's not a contract call
    sent: transactions.filter((tx) => {
      const from = (tx.from || "").toLowerCase();
      const isNativeTransfer = (tx.input || "") === "0x";
      return from === normalizedWallet && isNativeTransfer;
    }),

    // Incoming native token transfers: user is the recipient and it's not a contract call
    received: transactions.filter((tx) => {
      const to = (tx.to || "").toLowerCase();
      const isNativeTransfer = (tx.input || "") === "0x";
      return to === normalizedWallet && isNativeTransfer;
    }),

    // Contract interactions: any transaction with contract call data (input !== "0x")
    contractCalls: transactions.filter((tx) => {
      const input = (tx.input || "").toLowerCase();
      return input !== "0x" && input.length > 2;
    }),

    // Outgoing ERC20 token transfers: user is the sender
    tokensSent: tokenTransfers.filter((transfer) => {
      const from = (transfer.from || "").toLowerCase();
      return from === normalizedWallet;
    }),

    // Incoming ERC20 token transfers: user is the recipient
    tokensReceived: tokenTransfers.filter((transfer) => {
      const to = (transfer.to || "").toLowerCase();
      return to === normalizedWallet;
    }),
  };

  return result;
}
