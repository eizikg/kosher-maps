# KosherMaps - React Native Navigation App

A comprehensive React Native application providing Google Maps functionality with search and navigation capabilities, built with TypeScript for both iOS and Android platforms.

## 🚀 Features

### Core Navigation Features
- **Google Maps Integration** - Interactive map with Google Maps Navigation SDK
- **Turn-by-turn Navigation** - Voice guidance and real-time directions
- **Route Planning** - Multiple route options with traffic updates
- **Transportation Modes** - Support for driving, walking, cycling, and transit
- **Real-time Updates** - Live traffic information and route optimization

### Search & Discovery
- **Place Search** - Autocomplete search with Google Places API
- **Address Lookup** - Geocoding and reverse geocoding
- **Search History** - Recent searches and favorites management
- **Current Location** - Automatic location detection

### User Interface
- **Modern Design** - Clean, intuitive interface following platform guidelines
- **Route Preview** - Detailed route information before navigation
- **Navigation Card** - Real-time navigation instructions overlay
- **Permission Management** - Proper location permission handling

## 📱 Screenshots

*Screenshots will be available once you run the app on a device/simulator*

## 🛠 Technical Stack

### Core Dependencies
- **React Native 0.80.1** - Cross-platform mobile framework
- **TypeScript 5.0.4** - Type-safe JavaScript
- **@googlemaps/react-native-navigation-sdk 0.9.3** - Google Maps Navigation
- **react-native-permissions 5.4.1** - Permission management
- **react-native-vector-icons 10.2.0** - Icon library
- **@react-native-async-storage/async-storage 2.2.0** - Data persistence

### APIs & Services
- Google Maps Navigation SDK
- Google Places API (Autocomplete)
- Google Geocoding API
- Google Directions API

## 📦 Installation & Setup

### Prerequisites
1. **Node.js** (>= 18.0.0)
2. **React Native development environment** 
   - For iOS: Xcode and iOS Simulator
   - For Android: Android Studio and Android SDK
3. **Google Cloud Platform account** with billing enabled
4. **Google Maps API Key** with required APIs enabled

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd KosherMaps

# Install dependencies
npm install
```

### 2. Google Maps API Configuration

#### Enable Required APIs
In your Google Cloud Console, enable these APIs:
- Maps SDK for Android
- Maps SDK for iOS
- Maps JavaScript API
- Places API
- Geocoding API
- Directions API

#### Configure API Key

1. **Update Environment Variables**:
   ```bash
   # Edit .env file
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

2. **Android Configuration**:
   ```bash
   # Update the API key in Android strings
   # File: android/app/src/main/res/values/strings.xml
   <string name="google_maps_api_key">your_actual_api_key_here</string>
   ```

3. **iOS Configuration**:
   Create `ios/KosherMaps/GoogleService-Info.plist` or update `AppDelegate.swift` with your API key.

### 3. Platform-Specific Setup

#### Android Setup
```bash
# Install Android dependencies
cd android
./gradlew clean
cd ..

# For React Native 0.60+, linking is automatic
```

#### iOS Setup
```bash
# Install iOS dependencies
cd ios
pod install
cd ..
```

### 4. Run the Application

#### Android
```bash
# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android
```

#### iOS
```bash
# Start Metro bundler
npm start

# Run on iOS (in a new terminal)
npm run ios
```

## 🏗 Project Structure

```
KosherMaps/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MapView/         # Map component with Google Maps
│   │   ├── SearchBar/       # Search with autocomplete
│   │   ├── NavigationCard/  # Turn-by-turn instructions
│   │   └── RoutePreview/    # Route selection interface
│   ├── screens/             # App screens
│   │   └── MapScreen.tsx    # Main map interface
│   ├── services/            # Business logic and API calls
│   │   ├── googleMaps.ts    # Google Maps API integration
│   │   ├── navigation.ts    # Navigation functionality
│   │   ├── places.ts        # Places search and management
│   │   └── tempNavigation.ts # Temporary navigation service
│   ├── utils/               # Utilities and helpers
│   │   ├── constants.ts     # App constants and configuration
│   │   └── permissions.ts   # Location permission handling
│   └── types/               # TypeScript type definitions
│       ├── index.ts         # Main type definitions
│       └── react-native.d.ts # React Native extensions
├── android/                 # Android-specific files
├── ios/                     # iOS-specific files
├── .env                     # Environment configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Development

### Available Scripts

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Lint code
npm run lint

# TypeScript check
npx tsc --noEmit
```

### Key Components

#### MapView Component
- Integrates Google Maps Navigation SDK
- Handles location permissions and updates
- Manages map interactions and camera

#### SearchBar Component
- Implements Google Places Autocomplete
- Manages search history and favorites
- Provides real-time search suggestions

#### NavigationCard Component
- Displays turn-by-turn instructions
- Shows navigation progress and ETA
- Provides navigation controls

#### RoutePreview Component
- Shows multiple route options
- Allows transportation mode selection
- Provides route comparison

### Services Architecture

#### GoogleMapsService
- Geocoding and reverse geocoding
- Places search and details
- Directions calculation
- Location management

#### NavigationService
- Route calculation and optimization
- Turn-by-turn navigation
- Voice guidance management
- Navigation state management

#### PlacesService
- Search history management
- Favorites management
- Place details and autocomplete

## 🚨 Important Notes

### Current Implementation Status

The app is currently using **temporary components** for the Google Maps Navigation SDK integration. This is because:

1. **Google Maps Navigation SDK** requires additional setup and proper API key configuration
2. **Platform-specific configurations** need to be completed
3. **Device testing** is required for full functionality

### To Complete Setup:

1. **Add your Google Maps API key** to the `.env` file and platform-specific configuration files
2. **Configure Google Cloud Console** with proper API restrictions and billing
3. **Test on physical devices** (navigation features require actual GPS)
4. **Replace temporary components** with actual Google Maps Navigation SDK components

### Production Considerations

- **API Usage Monitoring** - Google Maps APIs have usage limits and costs
- **Offline Support** - Consider implementing offline map capabilities
- **Performance Optimization** - Optimize for battery usage during navigation
- **Error Handling** - Implement comprehensive error handling for network issues

## 🔐 Security

- **API Key Protection** - Never commit API keys to version control
- **Platform Restrictions** - Configure API key restrictions in Google Cloud Console
- **Permission Management** - Proper handling of location permissions
- **Data Privacy** - Secure handling of location data

## 📊 Performance

### Optimization Features
- **Lazy Loading** - Components load on demand
- **Caching** - Search results and location data caching
- **Debounced Search** - Optimized API call frequency
- **Memory Management** - Proper cleanup of listeners and watchers

### Expected Performance
- **App Launch** - < 3 seconds on modern devices
- **Search Response** - < 500ms for autocomplete
- **Route Calculation** - < 2 seconds for typical routes
- **Memory Usage** - Optimized for continuous navigation

## 🌍 Internationalization

The app structure supports internationalization:
- **Text Constants** - Centralized text management
- **RTL Support** - Right-to-left language support
- **Locale-based Services** - Location-aware search results

## 📈 Analytics & Monitoring

Consider implementing:
- **Usage Analytics** - Track user interactions and popular destinations
- **Performance Monitoring** - Monitor app performance and crashes
- **API Usage Tracking** - Monitor Google Maps API usage and costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is intended for educational and development purposes. Ensure you have proper Google Maps API licensing for production use.

## 🆘 Troubleshooting

### Common Issues

1. **"Module not found" errors** - Ensure all dependencies are installed with `npm install`
2. **API key issues** - Verify your Google Maps API key is correctly configured
3. **Permission errors** - Check location permissions on device/simulator
4. **Build failures** - Clean builds with `npm run clean` or `cd android && ./gradlew clean`

### Support

For technical issues:
1. Check the [React Native documentation](https://reactnative.dev/)
2. Review [Google Maps Platform documentation](https://developers.google.com/maps)
3. Check GitHub issues for similar problems

---

**Built with ❤️ using React Native and Google Maps Platform**