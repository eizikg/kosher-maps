# KosherMaps Setup Guide

## Google Maps API Key Setup

1. **Get your Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps SDK for Android
     - Maps SDK for iOS
     - Google Navigation SDK for Android
     - Google Navigation SDK for iOS
     - Directions API
     - Places API
     - Geocoding API
   - Create credentials (API Key)

2. **Add API Key to .env file:**
   ```bash
   # Replace YOUR_GOOGLE_MAPS_API_KEY_HERE with your actual API key
   GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```

3. **Platform-specific Configuration:**

   **iOS:**
   - API key is automatically read from .env file
   - Configured in `ios/KosherMaps/Info.plist`

   **Android:**
   - Update `android/app/src/main/res/values/strings.xml`:
     ```xml
     <string name="google_maps_api_key">YOUR_ACTUAL_API_KEY_HERE</string>
     ```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd ios && pod install && cd ..
   ```

2. **Run the app:**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

## Features Implemented

✅ **Core Features:**
- Google Maps Navigation SDK integration
- Real-time location tracking
- Places search with autocomplete
- Route calculation and visualization
- Turn-by-turn navigation
- Multiple transport modes (driving, walking, cycling, transit)

✅ **UI Components:**
- SearchBar with Google Places integration
- NavigationCard with turn-by-turn instructions
- RoutePreview with multiple route options
- MapView with route visualization

✅ **Services:**
- NavigationService for Google Maps Navigation SDK
- GoogleMapsService for Directions/Places API
- PlacesService for search history and favorites
- PermissionsService for location permissions

## Troubleshooting

**Map not loading:**
- Check that your Google Maps API key is correctly set in `.env` file
- Verify API key has the necessary permissions enabled
- Check network connectivity

**Location permissions:**
- App will prompt for location permissions on first use
- Make sure location services are enabled on device

**Build errors:**
- Run `npm run lint` and `npm run typecheck` to check for errors
- Clean and rebuild: `cd ios && rm -rf build && cd .. && npm run ios`

## Next Steps

The app is now fully functional! You can:
1. Search for destinations
2. Get route options
3. Start turn-by-turn navigation
4. View real-time navigation instructions

Enjoy your Google Maps alternative! 🗺️