// Format bigint as comma-separated number string
export function formatCoin(value: bigint | number): string {
  return Number(value).toLocaleString("en-US");
}

// Format bigint nanosecond timestamp to JS Date
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

// Format date nicely
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format date and time
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format timestamp bigint to datetime-local input value
export function nsToDatetimeLocal(ns: bigint): string {
  const date = nsToDate(ns);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Convert datetime-local string to nanosecond bigint
export function datetimeLocalToNs(dtStr: string): bigint {
  const date = new Date(dtStr);
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

// Time until match
export function timeUntil(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "Started";
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ${diffHours % 24}h`;
}

// Shorten principal
export function shortenPrincipal(principal: string): string {
  if (principal.length <= 14) return principal;
  return `${principal.slice(0, 7)}...${principal.slice(-5)}`;
}
