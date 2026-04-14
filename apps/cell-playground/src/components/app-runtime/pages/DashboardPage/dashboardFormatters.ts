export function prettify(s: string): string {
  return s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
