# Shift Booking App (Expo / React Native)

A React Native shift booking mobile and web application built with Expo SDK 58, TypeScript, and React Navigation.

---

## 🚀 Quick Run Guide

### 1. Ensure the Mock API is Running
Before starting the app, start the mock API from the project root:

```bash
cd ..
npm install
npm start
```
The API server will listen on `http://localhost:8080`.

### 2. Install App Dependencies
```bash
npm install
```

### 3. Run the App
```bash
npx expo start
```

Press:
- **`w`** for Web Browser (`http://localhost:8081`)
- **`a`** for Android Emulator (`10.0.2.2:8080` routed automatically)
- **`i`** for iOS Simulator (`localhost:8080`)
- Or scan the QR code using the **Expo Go** mobile app.

---

## 🧪 Running Tests

```bash
npm test
```

Runs the 33-test Jest suite covering date grouping, shift overlap algorithms, store reducers, selectors, and live API endpoints.

---

## 📱 Features

- **My Shifts Screen**:
  - Displays all booked shifts grouped chronologically by calendar date.
  - Section headers show date label (*Today*, *Tomorrow*, or full date) + shift count and total hours (e.g. `2 shifts, 4 h`).
  - Single-tap shift cancellation.
  - Shifts that have already started are disabled.
  - Pull-to-refresh to reload from API.

- **Available Shifts Screen**:
  - City tabs for *Helsinki*, *Tampere*, and *Turku* with dynamic shift count badges.
  - Intelligent overlap detection: shifts conflicting with any of your booked shifts display an **Overlapping** tag with a disabled **Book** button.
  - Past / finished shifts are hidden automatically.
  - Per-shift animated SVG loading spinners (`spinner_green.svg`, `spinner_red.svg`) during network actions.
  - Double-tap protection prevents duplicate booking requests.
  - Minute tick automatically updates started shift statuses in real time.

---

## ⚙️ Configuration

The network configuration lives in [`src/config/apiConfig.ts`](./src/config/apiConfig.ts).
- Default: `http://10.0.2.2:8080` on Android emulator, `http://localhost:8080` on iOS/Web.
- When running on a physical phone via Expo Go, replace with your computer's local Wi-Fi IP address (e.g. `http://192.168.1.100:8080`).
