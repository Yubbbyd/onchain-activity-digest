// Extend this list with verified Pharos ecosystem contracts as the network grows.
export const KNOWN_ADDRESSES = {
  "0x1234567890abcdef1234567890abcdef12345678": "Pharos DEX Router",
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "Pharos Token (PTT)",
  "0x0000000000000000000000000000000000000001": "Pharos Governance DAO",
  "0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddead": "Pharos Staking Contract",
  "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef": "Pharos Bridge",
};

export function labelAddress(address) {
  if (!address || typeof address !== "string") {
    return "Unknown Contract";
  }

  // Normalize address to lowercase for case-insensitive lookup
  const normalizedAddress = address.toLowerCase();

  // Check against known addresses (also normalize keys for comparison)
  for (const [knownAddress, label] of Object.entries(KNOWN_ADDRESSES)) {
    if (knownAddress.toLowerCase() === normalizedAddress) {
      return label;
    }
  }

  return "Unknown Contract";
}
