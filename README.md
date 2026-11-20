# Healzo — Less screen. More life.

A family app that helps parents reduce children's screen time with kind daily limits, screen-free activities, gardening projects, rewards and streaks. One app, two modes: **parent** and **child**, linked with a 6-letter code. No email or passwords.

Built with Expo (React Native) + Supabase. Android and iOS from one codebase.

## Features

**Parent:** family dashboard with each child's screen time ring, streak and points · per-child detail with a weekly chart, timer, manual time entry and an age-based limit (Indian Academy of Pediatrics guidance) · approve activities and reward requests · create family rewards · activity library (30 activities in 8 categories) · gardening guides · expert tips · shop for gardening, craft and science kits (cash on delivery) · invite a second parent.

**Child:** "time left today" ring with a start/stop screen timer and reminders 5 minutes before and when time is up · "Try this instead" suggestions · mark activities done to earn points (parent approves) · spend points on rewards · badges · a garden that grows with their streak.

## Setup

1. **Database**: In Supabase SQL Editor, run `supabase/healzo_setup.sql` (safe to re-run; only creates `hz_*` tables).
2. **Auth**: Supabase → Authentication → Sign In / Providers → turn on **Allow anonymous sign-ins**.
3. **Shop**: edit products in Table Editor → `hz_products`. Orders arrive in `hz_orders` (status: placed → confirmed → shipped → delivered).

## Run & build

```bash
npm install
npx expo start                                  # try on a phone with Expo Go
npx eas-cli build -p android --profile preview  # shareable APK
npx eas-cli build -p android --profile production   # Play Store bundle
npx eas-cli update --branch production -m "fix"     # over-the-air update
```

## Project layout

```
app/index.tsx          gate: routes to welcome / parent / kid
app/welcome.tsx        parent or child onboarding, joining with codes
app/parent/*           parent tabs: Family, Activities, Rewards, Shop, More
app/kid/*              child tabs: Today, Activities, Rewards, My garden
app/child/[id].tsx     parent's view of one child
lib/family.ts          Supabase data layer
lib/content.ts         activities, gardening guides, tips, badges (edit freely)
supabase/              database setup
```

Healzo provides general guidance for families, not medical advice.
