@AGENTS.md

# justPaint Art

iPhone and Android app for https://justpaint.art (a chronological wall of beginner paintings). Expo SDK 57, Expo Router, TypeScript strict. Apple first; Android later.

- Plan: vault note `A:\Users\matth\Desktop\obsidian brain\0 - Inbox\justPaint Art - App Plan.md`. Work is split into modules (A1, W2, ...). "Do module X" means: read only that module's item in the plan, do only it.
- Website repo (Next.js 16 + Supabase): `A:\Users\matth\Desktop\justpaint`. W modules happen there.
- This repo: https://github.com/FammyFams/justPaintApp, branch `main`. Push after each module's commit (pushing this repo deploys nothing).

## Session rules (user is on a usage-limited plan)

- One module per session. A module ends with: `npm run typecheck` and `npx expo lint` passing, the app starting, one commit named after the module (`A5 feed tab`), and the plan's box ticked with the commit hash.
- Resuming: run `git status` first. Finish the module, or discard the partial edits (`git restore .` plus removing new files) and redo it. The last commit always works.
- New code goes in new files; existing files get small hook-up edits only. Don't link a screen until it works.
- Read only what the module needs. Don't re-read whole plan notes or big files.

## Code layout

- `src/app/`: routes only; each file renders a screen from `src/screens/`.
- `src/screens/<name>/`: screen bodies and their private components.
- `src/components/`: shared UI (kebab-case files, one named export each).
- `src/data/`: one file per topic with TanStack Query hooks (paintings, artists, challenge, hearts, comments, notifications, blocks, account, images).
- `src/lib/`: `env.ts`, `supabase.ts`, `api.ts`.
- `src/theme.ts`: all colors, font, spacing, radius. No hard-coded colors outside it (from module A2 on).
- Styles: `StyleSheet.create` at the bottom of the component file.

## Backend

- Reads go straight to Supabase (public RLS). Never through justpaint.art: Vercel Hobby request and image-resize limits are close.
- Writes and private reads go to `https://justpaint.art/api/app/v1/*` with `Authorization: Bearer <access token>`. Browser roles can't write to Supabase.
- Viewing needs no account. Posting, hearts and comments need one. Report works signed out; block needs an account.
- Gotcha: when selecting paintings with the artist name, embed `profiles!paintings_owner_id_fkey(display_name)`, or PostgREST returns an "ambiguous relationship" error. Guest posts have `guest_name` and no profile.

## Design (same as the website)

- Colors: page `#fbf5f3`, text `#000022`, card `#fffdfc`, crimson `#c42847` (accent, text on it `#fbf5f3`), muted `#f2e6e2`, muted text `#5a586c`, orange `#e28413` (only with navy text), error red `#de3c4b`, border `#eaddd8`, input edge `#948985`. Radius 4.
- Font: Plus Jakarta Sans. Light mode only.
- Crimson is an accent, not a fill. No pill buttons, no soft blurred shadows, no staggered fade-ins. The main call to action is a hand-drawn crimson circle; every other button is plain crimson words (`Button` plain), never a box. Log out uses `tone="default"` (navy).
- Paintings have no card frame: one-column lists run them edge to edge with the title and "name · tags" as text underneath; two-column walls keep the page margin (artist pages leave the name out). Tags are plain lowercase text everywhere, never chips. Panels sit on the page, not in bordered boxes. Small capitals above headings (challenge labels) stay.
- Sentence case, like the website ("Display name", "Save changes", "Couldn't load the paintings."; since 2026-10-08). Only the tagline lines stay lowercase ("what did you paint today?", "a painting community for beginners."), and tags. No em dashes in app text. Log out is navy, not red.
- Accessibility: WCAG 2.2 AA contrast, font scaling on, 44pt touch targets, labels on icon buttons.
