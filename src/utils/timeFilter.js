// Timestamps can be in either Unix seconds or milliseconds.
// The utility automatically detects and normalizes them.

export function getStartTimestamp(days) {
  const now = Date.now();
  const millisecondsSince = days * 24 * 60 * 60 * 1000;
  return Math.floor((now - millisecondsSince) / 1000); // Return as Unix seconds
}

export function filterByTimeRange(items, days, timestampKey = "timestamp") {
  if (!Array.isArray(items)) {
    return [];
  }

  const startTimestamp = getStartTimestamp(days);

  return items.filter((item) => {
    let timestamp = item[timestampKey];

    if (timestamp === undefined || timestamp === null) {
      return false;
    }

    // Normalize timestamp to Unix seconds
    // If the value is > 10^10, assume it's in milliseconds and convert
    const numTimestamp = Number(timestamp);
    const normalizedTimestamp = numTimestamp > 1e10 ? Math.floor(numTimestamp / 1000) : numTimestamp;

    return normalizedTimestamp >= startTimestamp;
  });
}
