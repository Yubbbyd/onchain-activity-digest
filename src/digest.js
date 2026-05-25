import { fetchTransactions } from "./fetcher/transactions.js";
import { fetchTokenTransfers } from "./fetcher/tokenTransfers.js";
import { categorizeTransactions } from "./parser/categorize.js";
import { calculateGasSpent } from "./parser/gasCalculator.js";
import { extractHighlights } from "./parser/highlight.js";
import { formatSummary } from "./formatter/summary.js";
import { formatDetailed } from "./formatter/detailed.js";

export async function generateDigest(walletAddress, days = 7, format = "summary") {
  try {
    // Validate input
    if (!walletAddress || typeof walletAddress !== "string") {
      return {
        error: true,
        message: "Invalid wallet address provided.",
      };
    }

    if (!Number.isInteger(days) || days <= 0) {
      return {
        error: true,
        message: "Days must be a positive integer.",
      };
    }

    if (!["summary", "detailed"].includes(format)) {
      return {
        error: true,
        message: 'Format must be either "summary" or "detailed".',
      };
    }

    // Fetch transactions and token transfers in parallel
    const [transactions, tokenTransfers] = await Promise.all([
      fetchTransactions(walletAddress, days),
      fetchTokenTransfers(walletAddress, days),
    ]);

    // Categorize transactions
    const categorized = categorizeTransactions(transactions, tokenTransfers, walletAddress);

    // Calculate gas spent
    const gasSpent = calculateGasSpent(transactions, walletAddress);

    // Extract highlights
    const highlights = extractHighlights(categorized, walletAddress);

    // Build period object
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const period = {
      start: startDate.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
    };

    // Generate narrative
    const narrative = formatSummary(walletAddress, categorized, gasSpent, highlights, days);

    // Return based on format
    if (format === "detailed") {
      const detailedReport = formatDetailed(walletAddress, period, categorized, gasSpent, highlights, days);
      return detailedReport;
    }

    // Default to summary format
    return {
      narrative,
    };
  } catch (error) {
    console.error("Error generating digest:", error);
    return {
      error: true,
      message: error.message || "An unexpected error occurred while generating the digest.",
    };
  }
}
