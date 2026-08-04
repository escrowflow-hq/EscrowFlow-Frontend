# Contributing to EscrowFlow

Thanks for your interest in improving EscrowFlow. This repo is part of the
[EscrowFlow](https://github.com/escrowflow-hq) organization and is participating in
[Drips Wave](https://drips.network/), so contributions may be eligible for funding.

## Getting started

```bash
npm install
npm run dev
```

The dashboard runs entirely on a mock data layer by default (`NEXT_PUBLIC_USE_MOCK=true`),
so no backend is required to develop or test UI changes.

## Development workflow

1. Fork the repo and create a branch off `main`.
2. Make your changes, keeping components small and consistent with the existing design
   system (see `tailwind.config.ts`).
3. Run the full check suite before opening a PR:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

4. Open a pull request against `main` with a clear description of the change.

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add withdrawal method presets to wallet page
fix: correct milestone fee rounding in mock service
docs: update README setup instructions
refactor: extract shared badge component
test: cover fund escrow validation
chore: bump dependencies
```

## Code style

- TypeScript strict mode — avoid `any`, prefer explicit types at module boundaries.
- Tailwind utility classes over custom CSS; reuse tokens from `tailwind.config.ts`.
- Keep business logic in `src/lib` (pure, testable functions) separate from UI components.
