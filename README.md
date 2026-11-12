# Absensi TAM — Mobile App

Employee-facing mobile companion app for the TAM attendance system, built with Expo and React Native. Employees use it to check in/out with face verification and geolocation, submit leave/overtime/field-assignment requests, review their attendance history, and (for managers/approvers) approve or reject requests submitted by their team.

This app is the mobile client for the [`dashboard`](../dashboard) Next.js backend and talks to the same [`ai-model`](../ai-model) face-recognition service indirectly through the dashboard's API.

## Features

- **Authentication** — sign in, forgot/reset password, and account requests via Clerk (`@clerk/expo`)
- **Attendance** — camera-based face capture (`expo-camera`) and location capture (`expo-location`) for check-in/out, with an enrollment flow (`face-enrollment.tsx`) to register a face before first use
- **Leave requests** — Izin, Sakit (sick leave), and Cuti (paid leave) request forms, each with its own flow and status/type badges
- **Overtime (Lembur)** — request and track overtime, including an end-of-overtime drawer flow
- **Field assignment (Dinas Luar)** — create and track off-site work assignments
- **Attendance history (Histori)** — monthly-grouped attendance records, grouped/separated by month
- **Approvals** — dedicated approval tabs for leave, overtime, field assignment, and attendance verification requests (for managers/admins)
- **Employee profile** — identity, contact, employment, documents, training, and work-history sub-pages
- **Notifications** — in-app notification list with unread badge
- **OTA updates** — version-check modal against a hosted `version.json`/APK release flow (`expo-updates`)
- **Light/dark theme** support via a theme preference hook

## Tech Stack

- [Expo](https://expo.dev) SDK 57 with [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing, typed routes, React Compiler enabled)
- [React Native](https://reactnative.dev) 0.86 + [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org/)
- [NativeWind](https://www.nativewind.dev/) + Tailwind CSS v4 for styling
- [Clerk](https://clerk.com/) (`@clerk/expo`) for authentication
- [TanStack Query](https://tanstack.com/query) for server state/data fetching
- [Zustand](https://zustand-demo.pmnd.rs/) for client state
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for form handling and validation
- `expo-camera`, `expo-location`, `expo-image-picker`, `expo-document-picker`, `expo-file-system`, `expo-secure-store` for native device capabilities
- `react-native-calendars` for date pickers, `dayjs` for date handling
- [EAS Build](https://docs.expo.dev/eas/) for app builds/releases

## Prerequisites

- Node.js (LTS) and npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (invoked automatically via `npx expo`)
- The `dashboard` service running and reachable (this app is a thin client — it has no backend of its own)
- For native builds: Android Studio / Xcode as required by Expo, or an [EAS](https://docs.expo.dev/eas/) account for cloud builds

## Environment Variables

Create a `.env` file in the project root:

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Yes | Base URL of the `dashboard` Next.js API (e.g. `https://your-dashboard-domain.com`). `src/lib/api.ts` throws at startup if this is missing. |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key used by the `@clerk/expo` provider. Must belong to the same Clerk application the dashboard uses. |
| `EXPO_PUBLIC_VERSION_CHECK_URL` | No | URL of the hosted `version.json` used by the in-app update prompt. If unset, `src/lib/version-check.ts` logs a warning and skips the check. |

Authentication uses Clerk directly from the device (via `@clerk/expo`); no separate login endpoint is called — the Clerk session token is sent as a `Bearer` token to the dashboard API, which validates it via its own `clerkMiddleware`.

## Installation

```bash
npm install
```

## Running the App

```bash
# Start the Metro dev server (scan QR with Expo Go, or press a/i for emulator)
npm start

# Launch directly on Android / iOS / Web
npm run android
npm run ios
npm run web
```

Lint the project:

```bash
npm run lint
```

Reset to a blank starter project (destructive, provided by Expo's template tooling):

```bash
npm run reset-project
```

## Building & Releasing

Builds are configured in `eas.json` with three profiles:

| Profile | Purpose | Distribution | Android output |
|---|---|---|---|
| `development` | Dev client builds for local testing | internal | — |
| `preview` | Internal QA builds | internal | APK |
| `production` | Store/release builds | — | APK |

```bash
eas build --profile development --platform android
eas build --profile preview --platform android
eas build --profile production --platform android
```

OTA updates are published via `expo-updates`, with release metadata tracked in `version.json` (current release info and APK download URL are checked against this at runtime for the in-app update prompt).

## Permissions

The Android manifest requests `CAMERA`, `RECORD_AUDIO`, `ACCESS_COARSE_LOCATION`, and `ACCESS_FINE_LOCATION`, used for face capture during check-in/out and recording the employee's location.

## Project Structure

```
src/
  app/                  # Expo Router routes (file-based)
    (auth)/              # Login, forgot/reset password, request account, welcome
    (tabs)/
      (beranda)/          # Home tab
      (histori)/          # Attendance history tab
      (izin)/             # Leave requests tab
      (lembur)/           # Overtime tab
      (approval)/         # Approval inbox tab
      (profile)/          # Profile tab
    attendance-capture.tsx       # Check-in/out camera + location flow
    face-enrollment.tsx          # Face registration flow
    leave-request-{izin,sakit,cuti}.tsx
    field-assignment-create.tsx
    dinas-luar.tsx
    approval-{leave,overtime,field-assignment,attendance-verification}.tsx
    employee-data*.tsx           # Profile sub-pages (identity, contact, employment, documents, training, work history)
    rekapan-absen.tsx            # Attendance recap
    admin-users.tsx
    notifications.tsx
    change-password.tsx
  components/            # Shared UI components, grouped by feature (izin/, lembur/, approval/, beranda/, ui/)
  hooks/                 # Theme, OTA updates, query-cache reset, etc.
  lib/                   # API client (Clerk-authenticated fetch), geo helpers, date/grouping utilities, version check
  constants/              # Theme tokens, status enums
assets/                   # Images, icons, fonts
eas.json                  # EAS Build profiles
app.json                  # Expo app config (permissions, plugins, icons, updates)
```

## License

This repository includes the MIT-licensed Expo template license (`LICENSE`, © 650 Industries, Inc.) inherited from `create-expo-app`. Project-specific code ownership follows the organization's own terms.
