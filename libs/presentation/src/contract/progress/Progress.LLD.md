# Progress LLD

Track: `<div role="progressbar">` with `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`.
Fill: inner `<div>` translated via `translateX(-${100-value}%)` to animate from left.
Indeterminate: when value is undefined, applies `animate-indeterminate` or uses a pulsing animation.
No Radix dependency — pure HTML/Tailwind.
