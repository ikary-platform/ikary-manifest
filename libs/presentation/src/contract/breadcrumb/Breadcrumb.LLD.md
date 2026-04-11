# Breadcrumb LLD

Renders `<nav aria-label="breadcrumb">` containing an `<ol>` list.
Each item is an `<li>`. Non-last items with `href` render as `<a>` links.
Last item gets `aria-current="page"` and `text-foreground font-normal`.
Separator character rendered between items: "/" for slash, "›" (chevron-right icon) for chevron.
