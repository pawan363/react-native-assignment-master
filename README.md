# Shift Booking App 🗓️

A production-grade React Native (Expo) mobile and web application for browsing, booking, and managing work shifts across Finnish cities (Helsinki, Tampere, and Turku). Built strictly according to the design specification and product requirements document (PRD), paired with a local Hapi mock REST API.

---

## 📖 About The Project

Workers need a reliable, predictable interface to manage their schedules. This app provides a two-screen mobile experience powered by a single source of truth:

- **My Shifts**: View all currently booked shifts grouped chronologically by calendar date with day headers ("Today", "Tomorrow", or formatted dates like "September 22"), shift counts, and calculated total hours. Workers can cancel upcoming booked shifts with one tap. Shifts that have already started are automatically locked from cancellation.
- **Available Shifts**: Browse available work shifts filtered by city tabs (Helsinki, Tampere, Turku) with live shift count badges. Each shift card clearly reflects its state:
  - **Open**: Displays a green **Book** button.
  - **Booked by User**: Displays a **Booked** label alongside a red **Cancel** button.
  - **Overlapping**: Automatically flags conflicting shifts with an **Overlapping** label and disables the Book button.
  - **Started**: Disables actions for past/started shifts.
  - **In-Flight**: Replaces the action button with animated SVG spinners (`spinner_green.svg` or `spinner_red.svg`) during network requests.

### Core Architectural Principles

1. **Single Source of Truth**: Both screens subscribe to one central state store. Booking or cancelling a shift immediately updates the *My shifts* schedule, *Available shifts* list, and city counts without requiring manual refreshes.
2. **Client-Side Overlap Detection**: Matches backend booking rules (`startTime < other.endTime && endTime > other.startTime`) to visually inform users why a shift cannot be booked before they tap it.
3. **Non-Optimistic Robustness**: State updates only upon verified 200 HTTP responses from the API, preventing ghost states if a request is rejected by the server (e.g. concurrent conflict).
4. **Double-Tap Protection**: In-flight requests lock the target shift ID so accidental rapid taps never send duplicate requests.
5. **Real-Time Minute Tick**: A background interval updates local time every 60 seconds so shifts disable in real-time as their start time elapses.
6. **Design Spec Adherence**: Uses the exact design palette (`#004FB4` active blue, `#16A64D` green, `#E2006A` red/pink, `#F7F8FB` blue-grey backgrounds) with accessible touch targets (≥ 44pt).

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 58](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero compilation errors)
- **Navigation**: [React Navigation 7](https://reactnavigation.org/) (Bottom Tab Navigator)
- **State Management**: React Context + `useReducer` with pure selectors and memoization
- **Date Handling & Math**: Native Date utilities with local calendar grouping and duration totals
- **Icons & Graphics**: Custom SVG renderers via `react-native-svg` matching provided assets
- **Testing**: [Jest](https://jestjs.io/) and [ts-jest](https://kulshekhar.github.io/ts-jest/) (Unit, Store, Selector, and Integration tests)
- **Backend API**: Node.js with [Hapi](https://hapi.dev/) (in-memory mock database with artificial latency)

---

## 🚀 Steps to Run the Project

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or later (tested up to `v24.x`)
- **npm**: `v9.0.0` or later

---

### Step 1: Start the Backend Mock API

From the root directory of this repository:

```bash
# 1. Install root dependencies (Hapi server)
npm install

# 2. Start the API server
npm start
```

The API server will listen at **`http://localhost:8080`** (`http://127.0.0.1:8080`).

> ℹ️ **Node 18+ Compatibility**: A compatibility patch is integrated into `api/server.js` to ensure the 2018 Hapi 17 stream lifecycle runs smoothly on modern Node.js versions without premature request aborts.

---

### Step 2: Start the React Native App

Open a **new terminal window**, navigate to the `ShiftBookingApp` directory, and launch the Expo development server:

```bash
# 1. Navigate to the app directory
cd ShiftBookingApp

# 2. Install app dependencies
npm install

# 3. Start Expo
npx expo start
```

Once the Metro bundler QR code appears in your terminal, choose how you want to run the app:

| Platform | Command / Key | Description |
| :--- | :---: | :--- |
| **Web Browser** | Press **`w`** | Opens the app in your browser at **`http://localhost:8081`** |
| **Android Emulator** | Press **`a`** | Launches the app in Android Emulator (routes to host via `10.0.2.2:8080`) |
| **iOS Simulator** | Press **`i`** | Launches the app in Xcode iOS Simulator (`localhost:8080`) |
| **Physical Device** | Scan QR code | Open with **Expo Go** app (see note below for LAN IP configuration) |

#### 📱 Running on a Physical Mobile Device
When testing on a physical iPhone or Android phone via Expo Go, your phone cannot resolve `localhost`.
Open [`ShiftBookingApp/src/config/apiConfig.ts`](file:///c:/Users/saksh/Downloads/react-native-assignment-master/ShiftBookingApp/src/config/apiConfig.ts) and set `API_BASE_URL` to your computer's local Wi-Fi IP address:
```typescript
export const API_BASE_URL = 'http://192.168.1.XX:8080';
```

---

### Step 3: Run the Automated Test Suite

From the `ShiftBookingApp` directory:

```bash
cd ShiftBookingApp
npm test
```

This runs all **33 automated tests** across 4 test suites:

- **Unit Tests** ([`__tests__/dateUtils.test.ts`](file:///c:/Users/saksh/Downloads/react-native-assignment-master/ShiftBookingApp/__tests__/dateUtils.test.ts)):
  - Time formatting (`14:00`, `09:05`)
  - Relative calendar date labels (`Today`, `Tomorrow`, `September 22`)
  - Total duration sums and rounding (`2 shifts, 4 h`, `1 shift, 2.5 h`)
  - Overlap condition checks (`startTime < other.endTime && endTime > other.startTime`)
- **Store Tests** ([`__tests__/shiftReducer.test.ts`](file:///c:/Users/saksh/Downloads/react-native-assignment-master/ShiftBookingApp/__tests__/shiftReducer.test.ts)):
  - Reducers for fetch, book, and cancel operations
  - In-flight pending state transitions
  - Double-tap rejection (state identity preservation)
  - Error rollback and message assignment
- **Selector Tests** ([`__tests__/selectors.test.ts`](file:///c:/Users/saksh/Downloads/react-native-assignment-master/ShiftBookingApp/__tests__/selectors.test.ts)):
  - `selectBookedSections`: Groups booked shifts by date
  - `selectAvailableSections`: Filters by active city, omits expired shifts, flags conflicts
  - `selectCityCounts`: Live per-city tab counts
- **Integration Tests** ([`__tests__/apiIntegration.test.ts`](file:///c:/Users/saksh/Downloads/react-native-assignment-master/ShiftBookingApp/__tests__/apiIntegration.test.ts)):
  - Full end-to-end integration against the live mock API endpoints

---

## 📁 Repository Structure

```text
react-native-assignment-master/
├── api/                             # Mock Hapi REST API backend
│   ├── server.js                    # Hapi server entry point & CORS configuration
│   └── shifts-mock-api/             # Routes (GET, POST book, POST cancel) & mock DB
├── assets/                          # Original SVG spinner assets
├── design-spec.pdf                  # Visual reference document
├── package.json                     # API server dependencies
│
└── ShiftBookingApp/                 # React Native (Expo) Application
    ├── App.tsx                      # Root navigation container & safe area provider
    ├── jest.config.js               # Jest test runner configuration
    ├── tsconfig.json                # TypeScript compiler configuration
    ├── package.json                 # App dependencies & scripts
    │
    ├── __mocks__/                   # Test environment mocks (React Native Web)
    ├── __tests__/                   # Comprehensive test suites
    │   ├── apiIntegration.test.ts   # Live API integration tests
    │   ├── dateUtils.test.ts        # Date, grouping, and overlap unit tests
    │   ├── selectors.test.ts        # Memoized state selector tests
    │   └── shiftReducer.test.ts     # Pure reducer state transition tests
    │
    └── src/
        ├── api/
        │   └── shiftsApi.ts         # REST client with typed error mapping
        ├── config/
        │   └── apiConfig.ts         # Network base URL configuration
        ├── components/
        │   ├── CityTabs.tsx         # City filter bar with dynamic counts
        │   ├── DateHeader.tsx       # Date section header with shift & hour totals
        │   ├── EmptyState.tsx       # Accessible empty list placeholder
        │   ├── ShiftRow.tsx         # Shift row with dynamic states & actions
        │   └── Spinner.tsx          # Custom animated SVG loading spinner
        ├── screens/
        │   ├── AvailableShiftsScreen.tsx # Available shifts list & filtering
        │   └── MyShiftsScreen.tsx        # Booked shifts schedule & cancellation
        ├── store/
        │   └── ShiftContext.tsx     # Centralized state provider & selectors
        ├── theme/
        │   └── colors.ts            # Design spec color constants
        ├── types/
        │   └── shift.ts             # TypeScript domain models
        └── utils/
            └── dateUtils.ts         # Pure date, time, and overlap helper functions
```

---

## 📡 API Contract Reference

The app interacts with the mock Hapi server at `http://localhost:8080/shifts`:

| Method | Endpoint | Description | Constraints & Error Handling |
| :---: | :--- | :--- | :--- |
| **`GET`** | `/shifts` | Returns all 34 shifts across all cities | Returns full dataset; filtering is client-driven |
| **`GET`** | `/shifts/{id}` | Returns a single shift by UUID | `404 Not Found` if unknown ID |
| **`POST`** | `/shifts/{id}/book` | Books a shift by ID | `400 Bad Request` if already booked, finished, started, or overlapping |
| **`POST`** | `/shifts/{id}/cancel` | Cancels an existing booking | `400 Bad Request` if shift was not booked |

---

## 💡 Key Design Decisions & Optimizations

- **Pure Selectors for Shift Decoration**:
  Instead of mutating shift objects or storing derived booleans in global state, shifts remain raw entities in state. Pure selectors calculate `isStarted`, `isFinished`, and `isOverlapping` on the fly.
- **Overlap Performance ($O(N \cdot K)$)**:
  Available shifts are compared only against shifts that are currently `booked: true`. Overlap checks avoid redundant scans over the full list.
- **SectionList Virtualization**:
  Lists implement `initialNumToRender={12}`, `maxToRenderPerBatch={10}`, and `removeClippedSubviews` to maintain smooth 60fps scrolling on both mobile and web viewports.
- **Accessibility**:
  All buttons include descriptive `accessibilityLabel` strings (e.g. `"Book shift 14:00 to 16:00 in Helsinki"`), proper `accessibilityRole`, and `accessibilityState` indicators.
