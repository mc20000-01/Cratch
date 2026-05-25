# Visual regression workflow

## Component preview workflow

We use Storybook for core primitives and composites.

- Run locally: `pnpm --dir apps/web storybook`
- Build static preview: `pnpm --dir apps/web build-storybook`

Current critical stories include state coverage for:

- default
- loading
- empty
- error
- success
- disabled (where applicable)

## Screenshot regression checks

Visual checks are powered by Playwright screenshot assertions against Storybook stories.

- Run checks: `pnpm --dir apps/web test:visual`
- Refresh snapshots intentionally: `pnpm --dir apps/web test:visual:update`

CI runs visual regression on every pull request.

## Merge gate and approvals

PRs that touch `apps/web/src/**` or visual snapshots must include the `visual-approved` label after visual review.

- The `visual-regression` CI job must pass.
- The `visual-approval-gate` CI job fails without `visual-approved` for UI-impacting diffs.

## Safe snapshot update checklist

Before committing updated snapshots:

1. Run `pnpm --dir apps/web test:visual:update` only after intentional UI changes.
2. Open changed images in `apps/web/visual-tests/__snapshots__/` and verify each difference matches the intended design outcome.
3. Confirm there are no unrelated token/style changes in the same commit.
4. Include rationale in your PR description.
5. Add the `visual-approved` label only after reviewer signoff.

This prevents accidental approvals of unintended regressions.
