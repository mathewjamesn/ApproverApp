# Pikme Approver — React Native prototype (v1.0, bare React Native)

Clickable prototype of the Pikme Approver admin app (driver approvals, trips, reports and admin
tools) in plain React Native (no Expo). Same stack, theme and building blocks as the WhereRU Driver
prototype (`DriverApp-Prototype-WithPhase3`). All data is sample data: nothing talks to the server.

Stack: React Native 0.76.9 (New Architecture) · TypeScript · React Navigation 7 (native stack) ·
react-native-svg · react-native-safe-area-context.

## Run on a phone or emulator

Needs Node 18+, JDK 17 and the Android SDK (Android Studio).

```bash
npm install
npm start            # Metro bundler, keep it running
npm run android      # in a second terminal, with a phone (USB debugging) or emulator attached
```

## Build an installable APK

- **Locally:** `npm run apk` → `android/app/build/outputs/apk/release/app-release.apk`
  (signed with the debug key, fine for sideloading a prototype).
- **GitHub Actions:** push to `main` (or run the workflow by hand). Download the
  `PikmeApproverPrototype-apk` artifact from the run.

Package `com.gmt.pikme.approver.prototype`, so it installs next to the real app. Android only; there
is no iOS folder.

## Using the prototype

- The launcher offers **Start signed out** (sign in → code → Home), **Start signed in** and
  **Browse all screens**.
- The small dark tab on the right edge of every screen opens the **Prototype** menu to jump to any
  screen or restart.
- Sign-in code: any 5 digits (00000 = wrong code).
- Any 10-digit number in Find a driver / Find a passenger opens the sample profile.
- Fare multiplier and airport surcharge accept any authorisation code.

## Screens

| Area | Screens |
|---|---|
| Sign in | Mobile number with Production/Staging switch, 5-digit code |
| Home | Review queue card, today’s numbers, Needs attention, completed trips (14 days) |
| Approvals | Waiting (with checks done and expiry warnings), Sent back with reasons, Find driver |
| Driver review | Profile → Licence → Vehicle checks, document viewer, reject with reason chips, approve driver or send back, then straight to the next driver |
| Trips | Search (trip id, names, phone, places), status chips, trip details (route, ride PIN, money split, driver and passenger) |
| People | Driver profile (locate, documents, change RC, approve payment, trips, login OTP, reset ride, block/unblock, delete), driver location, passenger profile (wallet, trips, login OTP, reset ride, block/unblock, delete) |
| Insights | Reports: registrations by state and stage (chart + table), today’s trip outcomes, 14-day trend |
| Tools | Login OTP lookup, send notification to all drivers/passengers with preview, fare multiplier with live example, airport surcharge, environment |

Charts: one hue per series in a fixed order, tap a bar to read its value, legend for the stacked
chart, and the same numbers in a table.

## Project layout

```
App.tsx         navigation container and the list of screens
src/nav.ts      router.push('/home') style helper over React Navigation
src/screens/    one file per screen
src/ui/         Screen, Button, Parts, Bits (pills, tiles, rows), Chrome (tab bar, sheet, toast), Charts, Map
src/state/      store.ts (prototype state), data.ts (sample data)
src/theme.ts    design tokens (black + lime), same as the driver prototype
android/        standard React Native Android project
```
