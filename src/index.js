import { generateDigest } from "./digest.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load skill metadata from skill.json
const skillMetadataRaw = readFileSync(join(__dirname, "../skill.json"), "utf-8");
const skillMetadata = JSON.parse(skillMetadataRaw);

// Input schema definition for the skill
const inputSchema = {
  wallet: {
    type: "string",
    description: "The wallet address to analyze",
    required: true,
  },
  days: {
    type: "number",
    description: "Number of days to look back",
    default: 7,
  },
  format: {
    type: "enum",
    enum: ["summary", "detailed"],
    description: "Output format",
    default: "summary",
  },
};

// Store the skill object
const skill = {
  name: skillMetadata.name,
  description: skillMetadata.description,
  version: skillMetadata.version,
  inputSchema,
  async execute(inputs) {
    // Validate required inputs
    if (!inputs.wallet) {
      return {
        error: true,
        message: "Wallet address is required.",
      };
    }

    // Extract and validate inputs
    const walletAddress = inputs.wallet;
    const days = inputs.days || 7;
    const format = inputs.format || "summary";

    // Call the digest generator
    return await generateDigest(walletAddress, days, format);
  },
};

// Export the skill
export default skill;

// CLI test mode: check if this module is the entry point
if (process.argv[1].includes("index.js") && !process.argv[1].includes("node_modules")) {
  // Test with parameters from command line
  const testInputs = {
    wallet: process.argv[2] || "0x1234567890abcdef1234567890abcdef12345678",
    days: parseInt(process.argv[3] || "7", 10),
    format: process.argv[4] || "summary",
  };

  console.log(`Testing skill: ${skill.name}`);
  console.log(`Inputs:`, testInputs);
  console.log("---\n");

  (async () => {
    const result = await skill.execute(testInputs);

    if (result.error) {
      console.error("Error:", result.message);
      process.exit(1);
    }

    if (testInputs.format === "summary") {
      console.log("=== SUMMARY ===\n");
      console.log(result.narrative);
    } else {
      console.log("=== DETAILED REPORT ===\n");
      console.log(JSON.stringify(result, null, 2));
    }
  })().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
