# Testing Guide

This guide covers both automated tests and manual walkthroughs for evaluating the
EscrowFlow frontend, e.g. for SCF review.

## 1. Automated tests

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run lint         # ESLint
npm test             # Vitest suite
```

Test files live alongside the code they cover (`*.test.ts` / `*.test.tsx`), including
coverage for the mock escrow service, KYC validation, wallet logic, the "new project"
wizard, OAuth token verification, and the auth store.

## 2. Manual walkthrough (mock mode)

Run locally with the mock data layer (default):

```bash
cp .env.example .env.local   # NEXT_PUBLIC_USE_MOCK=true
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or go straight
to [http://localhost:3000/app](http://localhost:3000/app) for the dashboard.

### Seeded demo accounts

The mock backend seeds a few identities in `src/lib/mock/data.ts`. Log in with any of
these emails and **any password of 8+ characters** — the mock layer doesn't check the
password, only its length:

| Email | Role |
| --- | --- |
| `alex@escrowflow.dev` | Client |
| `nina@example.com` | Client |
| `marcus@example.com` | Client |
| `priya@example.com` | Freelancer |
| `sam@example.com` | Freelancer |

Logging in with an unrecognized email creates a new identity with whichever role is
selected on the login form.

### Role-based views

1. Log in as a **client** (e.g. `alex@escrowflow.dev`) — the dashboard should show
   projects you've created, with controls to fund escrow and approve milestones.
2. Log out and log in as a **freelancer** (e.g. `priya@example.com`) — the same project
   list should instead show controls to submit milestones and withdraw released funds.
3. Confirm actions unavailable to a role (e.g. a freelancer approving their own
   milestone) are not exposed in the UI.

### Escrow lifecycle

1. As a client, go to **New Project** (`/app/projects/new`) and complete the wizard to
   create a project with at least one milestone.
2. Fund the project's escrow from the project detail page.
3. Log in as the assigned freelancer and submit the first milestone.
4. Log back in as the client and approve the milestone — verify funds release minus the
   platform fee, and the project completes once every milestone is approved.
5. Log in as the freelancer and withdraw the released balance from the **Wallet** page,
   checking the fee schedule shown for the destination/method chosen.

### KYC verification

1. Go to **Settings** (`/app/settings`) → **Identity verification (KYC)**.
2. Walk through the verification flow and confirm status updates (e.g.
   pending → verified) are reflected in the UI.

### Stellar wallet

1. From **Settings** → **Stellar wallet**, confirm a wallet address/QR code is displayed.
2. Confirm the wallet section on the **Wallet** page (`/app/wallet`) reflects balances
   and transaction history consistent with actions taken during the escrow lifecycle
   walkthrough above.

### Auth extras

- **Forgot password** (`/app/(auth)/forgot-password`): submit an email and confirm the
  confirmation state.
- **Google / Apple sign-in**: functional against real provider credentials only if
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_APPLE_CLIENT_ID` are set in `.env.local`
  (see comments in `.env.example`); Apple sign-in requires a deployed HTTPS domain and
  will not work on `localhost`.

## 3. Testing against a real API

Set `NEXT_PUBLIC_USE_MOCK=false` and `NEXT_PUBLIC_API_URL` to a running instance of
[escrowflow-api](https://github.com/escrowflow-hq/escrowflow-api), then repeat the
walkthroughs above — the UI and business rules are identical, only the data source
changes.
