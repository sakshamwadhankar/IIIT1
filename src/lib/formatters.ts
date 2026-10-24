/** Display formatters for minutes, INR fares, and walking distances. */

export function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} min`;
}

export function formatFare(fareInr: number): string {
  return `₹${Math.round(fareInr)}`;
}

export function formatWalking(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDeltaMinutes(delta: number): string {
  const rounded = Math.round(Math.abs(delta));
  if (rounded === 0) return 'same arrival time';
  return delta > 0 ? `${rounded} min faster` : `${rounded} min slower`;
}

export function formatDeltaFare(delta: number): string {
  const rounded = Math.round(Math.abs(delta));
  if (rounded === 0) return 'the same fare';
  return delta > 0 ? `₹${rounded} cheaper` : `₹${rounded} more expensive`;
}

export const CONFIDENCE_LABEL: Record<string, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  limited: 'Limited evidence',
};

export const SEVERITY_LABEL: Record<string, string> = {
  info: 'Info',
  caution: 'Caution',
  warning: 'Warning',
};
