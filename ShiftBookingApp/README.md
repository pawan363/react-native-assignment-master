# Shift Booking App

A React Native (Expo) application for booking and managing work shifts across different cities.

## Features

- **My Shifts** — View all your booked shifts grouped by date. Cancel booked shifts with one tap.
- **Available Shifts** — Browse shifts filtered by city (Helsinki, Tampere, Turku). Book or cancel shifts.
- Pull-to-refresh on both screens
- Per-shift loading indicators during booking/cancelling
- Relative date labels (Today, Tomorrow, or full date)
- Clean, modern UI with green/red color scheme

## Tech Stack

- **React Native** with **Expo** (blank template)
- **React Navigation** — Bottom tab navigator
- **React Context + useReducer** — State management
- **TypeScript** — Type-safe throughout

## Prerequisites

- Node.js >= 18
- Expo CLI (`npx expo`)
- The mock API server running (see below)

## Setup

### 1. Start the Mock API

From the project root (one level up):

```bash
cd ..
npm install
npm start
```

The API server will run at `http://localhost:8080`.

### 2. Install App Dependencies

```bash
npm install
```

### 3. Run the App

```bash
npx expo start
```

Then:
- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan QR code with Expo Go app on a physical device

## Project Structure

```
ShiftBookingApp/
├── App.tsx                          # Root component with navigation
├── index.js                         # Entry point
├── src/
│   ├── api/
│   │   └── shiftsApi.ts             # REST API service layer
│   ├── components/
│   │   ├── AreaFilter.tsx           # City filter pills
│   │   ├── EmptyState.tsx           # Empty list placeholder
│   │   ├── ShiftCard.tsx            # Shift display card with actions
│   │   └── ShiftSectionHeader.tsx   # Date section header
│   ├── screens/
│   │   ├── AvailableShiftsScreen.tsx # Available shifts tab
│   │   └── MyShiftsScreen.tsx       # My shifts tab
│   ├── store/
│   │   └── ShiftContext.tsx         # Global state (Context + Reducer)
│   ├── types/
│   │   └── shift.ts                 # TypeScript interfaces
│   └── utils/
│       └── dateUtils.ts             # Date formatting helpers
├── app.json
├── package.json
└── tsconfig.json
```

## API Endpoints

| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | `/shifts`            | Get all shifts         |
| GET    | `/shifts/{id}`       | Get shift by ID        |
| POST   | `/shifts/{id}/book`  | Book a shift           |
| POST   | `/shifts/{id}/cancel`| Cancel a booked shift  |
