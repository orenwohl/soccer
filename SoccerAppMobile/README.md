# כדורגל שכונתי (Neighborhood Soccer) Mobile App

A React Native mobile application for organizing neighborhood soccer games, tracking players, matches, and statistics.

## Features

-   Player management with ratings
-   Match creation and result tracking
-   League table and statistics
-   Mobile-friendly UI optimized for iOS and Android

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS simulator (requires macOS)
npm run ios

# Run on Android emulator
npm run android
```

## Build for App Store Submission

### iOS App Store

1. Install EAS CLI:

    ```bash
    npm install -g eas-cli
    ```

2. Log in to your Expo account:

    ```bash
    eas login
    ```

3. Configure the build:

    ```bash
    eas build:configure
    ```

4. Build for iOS:

    ```bash
    eas build --platform ios
    ```

5. Submit to App Store:
    ```bash
    eas submit --platform ios
    ```

### Google Play Store

1. Make sure you have an Android Keystore. If not, generate one:

    ```bash
    eas build:configure android
    ```

2. Build for Android:

    ```bash
    eas build --platform android
    ```

3. Submit to Google Play:
    ```bash
    eas submit --platform android
    ```

## Project Structure

```
SoccerAppMobile/
├── app/                 # Main application screens
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx    # Home screen
│   │   ├── players.tsx  # Players screen
│   │   ├── matches.tsx  # Matches screen
│   │   └── table.tsx    # League table screen
├── components/          # Reusable UI components
├── services/            # API and other services
├── assets/              # Images and other static assets
└── app.json             # App configuration
```

## Backend Integration

The app is designed to work with the existing backend API. The API URL can be configured in `services/api.ts`.

## Test Account

For testing purposes, you can use the following account:

-   Username: `test@example.com`
-   Password: `password123`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
