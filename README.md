# Life Journal Daily Devotions

A comprehensive Bible reading and journaling application with live chat functionality.

## Features

- **Daily Bible Reading Plan**: Complete year-long reading plan with themed daily readings
- **SOAP Study Method**: Scripture, Observation, Application, Prayer journaling
- **Progress Tracking**: Visual calendar showing completed days and progress
- **Live Group Chat**: Real-time chat with other users for encouragement and prayer
- **Bible Search**: Search through scripture verses
- **Sharing**: Share your SOAP entries with others
- **Resources**: Links to helpful Bible study resources
- **Progressive Web App**: Install on mobile devices like a native app

## Mobile App Installation

### Progressive Web App (PWA) - Recommended
The app is built as a PWA and can be installed on mobile devices:

**For iPhone/iPad:**
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to install

**For Android:**
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Install" to confirm

**Features when installed:**
- Works offline for reading and journaling
- Push notifications (future feature)
- Full-screen experience
- App icon on home screen
- Fast loading from home screen

### Native App Development Options

#### Option 1: React Native (Recommended for Native Apps)
```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Create new React Native project
npx react-native init LifeJournalMobile

# Copy components and adapt for React Native
```

#### Option 2: Capacitor (Hybrid App)
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init LifeJournal com.newhope.lifejournal

# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync
```

#### Option 3: Expo (Easiest for React Developers)
```bash
# Install Expo CLI
npm install -g @expo/cli

# Create new Expo project
npx create-expo-app LifeJournalMobile

# Copy and adapt components
```

## Live Chat Setup

The application includes a live chat feature that works in two modes:

### Demo Mode (Default)
- Uses localStorage to simulate real-time chat
- Perfect for testing and demonstration
- No server setup required

### Live Server Mode
For real-time chat across multiple users:

1. **Install server dependencies:**
   ```bash
   cd src/server
   npm install
   ```

2. **Start the chat server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001`

3. **The app will automatically connect** to the server when available

### Production Deployment

For production, you can deploy the chat server to:
- **Heroku**: Easy deployment with WebSocket support
- **Railway**: Modern platform with automatic deployments
- **DigitalOcean**: VPS with full control
- **AWS/Google Cloud**: Scalable cloud solutions

#### Environment Variables for Production:
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-app-domain.com
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## App Store Deployment

### iOS App Store
1. Use React Native or Capacitor to create iOS app
2. Set up Apple Developer Account ($99/year)
3. Configure app in App Store Connect
4. Submit for review (typically 1-7 days)

### Google Play Store
1. Use React Native or Capacitor to create Android app
2. Set up Google Play Developer Account ($25 one-time)
3. Upload APK/AAB to Play Console
4. Submit for review (typically 1-3 days)

### Alternative Distribution
- **TestFlight** (iOS): Beta testing before App Store
- **Firebase App Distribution**: Cross-platform beta testing
- **Direct APK**: Android users can install directly

## Embedding in WordPress/Divi

The application can be easily embedded in WordPress using an iframe:

```html
<div class="life-journal-embed">
  <iframe 
    src="https://your-deployed-app.netlify.app" 
    width="100%" 
    height="800"
    frameborder="0">
  </iframe>
</div>
```

## Chat Features

- **Real-time messaging** with other users
- **Prayer requests** and encouragement
- **Online user indicators**
- **Message types**: Regular messages, prayers, encouragement
- **Automatic reconnection** if connection is lost
- **Fallback to demo mode** if server is unavailable

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **PWA**: Service Worker, Web App Manifest
- **Chat**: Socket.IO for real-time communication
- **Build Tool**: Vite
- **Deployment**: Netlify (frontend), Heroku/Railway (chat server)

## License

This project is created for New Hope West church community.