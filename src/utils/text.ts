/** Convert "shahrol bin ali" → "Shahrol Bin Ali" */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Capitalize first letter only: "landed" → "Landed" */
export function capitalize(str: string | null | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
