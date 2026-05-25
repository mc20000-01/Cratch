# Design Tokens

This project centralizes frontend styling in `apps/web/src/tokens.css`.

## Inventory (baseline before tokenization)

The original UI used repeated hard-coded values in `apps/web/src/styles.css`:

- **Colors**: `#0b0f14`, `#e8eef7`, `#101722`, `#1b2740`, `#30496f`, `#2d3a55`, `#66a3ff`, `#8ca1c9`, `#ff9fa6`, `#8b0000`, `#fff4f4`, `#d66`, etc.
- **Spacing**: `6px`, `8px`, `10px`, `12px`, `16px`, `2rem`.
- **Font sizes**: `0.9rem`.
- **Radii**: `8px`, `10px`, `12px`.
- **Shadows**: `0 0 0 1px #66a3ff`.

## Canonical token source

Use `apps/web/src/tokens.css` as the only source for tokens.

- Semantic colors (examples):
  - `--color-text-primary`
  - `--color-bg-surface`
  - `--color-border-emphasis`
- Foundation tokens:
  - spacing: `--space-*`
  - radius: `--radius-*`
  - shadow: `--shadow-*`
  - typography: `--font-family-sans`, `--font-size-sm`

## Usage examples

```css
.panel {
  padding: var(--space-5);
  border-right: 1px solid var(--color-border-subtle);
}

.node.selected {
  border-color: var(--color-border-emphasis);
  box-shadow: var(--shadow-focus-ring);
}
```

## Guardrail

Run `pnpm --dir apps/web lint:styles`.

This check fails when non-tokenized hard-coded hex colors are added in `src/**/*.{css,ts,tsx}` (excluding the token file itself).
