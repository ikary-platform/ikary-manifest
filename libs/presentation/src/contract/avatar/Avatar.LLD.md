# Avatar LLD

Renders a circular container with either an `<img>` or fallback `<span>` with initials.
Uses React `onError` on the img to flip to fallback state.
Sizes: sm=h-8 w-8, md=h-10 w-10 (default), lg=h-14 w-14.
Fallback background: `bg-muted text-muted-foreground text-xs font-medium`.
No Radix dependency — pure HTML/Tailwind with local state for img error.
