# Accessibility Checklist

Use this checklist during feature development and release QA.

## Interactive components

- [ ] Every interactive control has a visible focus indicator (`:focus-visible` and keyboard reachable state).
- [ ] Disabled controls are consistently styled (reduced emphasis, clear disabled cursor/state, and not the same as enabled state).
- [ ] Icon-only controls include an accessible label (`aria-label` or visible text).

## Keyboard and tab order

- [ ] Tab sequence is logical in forms, dialogs, menus, and workspace interactions.
- [ ] Composite rows/cards that act like buttons are keyboard focusable and support Enter/Space activation.
- [ ] No keyboard traps are introduced in overlays or popovers.

## Color contrast (WCAG AA)

- [ ] Body text has at least 4.5:1 contrast against backgrounds.
- [ ] Large text (18pt+ or 14pt bold+) has at least 3:1 contrast.
- [ ] UI component boundaries and control states meet 3:1 contrast where required.
- [ ] Error and status colors are verified in token definitions before release.

## Forms and validation

- [ ] Form errors are announced (e.g., `role="alert"` / `aria-live`) and visually linked to their related fields (`aria-describedby`).
- [ ] Invalid fields expose `aria-invalid="true"`.
- [ ] Error messaging is actionable and specific.

## Release QA sign-off

- [ ] This checklist is reviewed before tagging a release.
- [ ] Any accessibility exceptions are documented with owner and follow-up date.
