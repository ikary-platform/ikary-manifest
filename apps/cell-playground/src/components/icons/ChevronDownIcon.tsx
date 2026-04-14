export function ChevronDownIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, transition: 'transform 0.15s ease', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}
