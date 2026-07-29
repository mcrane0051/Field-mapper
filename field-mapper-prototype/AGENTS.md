# AGENTS.md — Tackle Prototype

This file tells AI coding agents (Cursor, Claude Code, Codex, Aider, GitHub Copilot, etc.) how to assist on this prototype.

## Project context

This prototype was scaffolded from `@tackle-io/design-system` and uses the Tackle design system for all UI. Build pages and components by composing exported design system primitives — never reach for ad-hoc styling, custom shells, or hand-rolled equivalents of design system components.

## Skills available in this project

This prototype ships with the following Tackle agent skills, installed automatically via the `@tackle-io/design-system` package and mapped below by [TanStack Intent](https://tanstack.com/intent):

- **`tackle-design-system`** — component inventory, tokens, shells, composition patterns, validation checklist for any Tackle UI work.
- **`tackle-content-style`** — voice, tone, terminology, casing, punctuation rules for all user-facing copy.
- **`tackle-accessibility`** — WCAG 2.2 AA, ARIA per W3C APG, keyboard, focus management, contrast, live regions, forms.

The `intent-skills` block below is generated and maintained by `npx @tanstack/intent install --map`. Do not edit it by hand — re-run that command from this directory to refresh.

## Always-on rules

For **any** UI work in this prototype, agents MUST also load the `tackle-accessibility` skill alongside `tackle-design-system`. Composition-level a11y (forms, focus order, landmarks, custom UI) is not covered by the design system components themselves and must be enforced at the page level.

For **any** user-facing copy (labels, button text, headings, helper text, alerts, tooltips, empty states), agents MUST also load `tackle-content-style`.

## Force-loading a skill

If your agent's output does not follow Tackle conventions, force-load the relevant skill explicitly. In Cursor, type one of:

- `/tackle-design-system`
- `/tackle-content-style`
- `/tackle-accessibility`

In Claude Code or other agents, paste the equivalent: `Load the tackle-design-system skill from node_modules/@tackle-io/design-system/skills/tackle-design-system/SKILL.md and follow it.`

## Inspecting installed skills

To see every skill currently available to your agent in this project:

```bash
npx @tanstack/intent list
```

To refresh the skill mappings in this file after `npm update @tackle-io/design-system`:

```bash
npx @tanstack/intent install --map
```

<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@tackle-io/design-system#tackle-accessibility"
    run: "npx @tanstack/intent@latest load @tackle-io/design-system#tackle-accessibility"
    for: "Enforces WCAG 2.2 AA accessibility for all Tackle UI work — components, pages, forms, custom widgets, and prototypes. Covers semantic HTML, ARIA roles and attributes per W3C APG patterns, keyboard interaction, focus management and visible focus, color and non-text contrast, live regions, form accessibility, and motion preferences. Use whenever building or modifying any UI in Tackle Platform, Tackle in AppDirect, Tackle for Salesforce, or a Tackle prototype. Triggers on accessibility, a11y, WCAG, ARIA, keyboard, focus, contrast, screen reader, axe, label, fieldset, tabindex, role, aria-, prefers-reduced-motion, or any composition-level UI work where a11y concerns apply."
  - id: "@tackle-io/design-system#tackle-content-style"
    run: "npx @tanstack/intent@latest load @tackle-io/design-system#tackle-content-style"
    for: "Enforces the Tackle content style guide for all UI copy, labels, headings, helper text, alerts, tooltips, empty states, and documentation strings. Use when writing or reviewing user-facing text in Tackle Platform, Tackle in AppDirect, or Tackle for Salesforce. Triggers on mentions of UI copy, content, labels, microcopy, UX writing, button text, error messages, or empty states."
  - id: "@tackle-io/design-system#tackle-design-system"
    run: "npx @tanstack/intent@latest load @tackle-io/design-system#tackle-design-system"
    for: "Enforces the Tackle design system for all UI code, designs, and prototypes. Use when building React components, pages, prototypes, or Figma designs for Tackle Platform, Tackle in AppDirect, or Tackle for Salesforce. Triggers on mentions of Tackle UI, design system, components, tokens, design, prototype, wireframe, mockup, or any @tackle-io/design-system import."
<!-- intent-skills:end -->
