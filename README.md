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
- **Chat**: Socket.IO for real-time communication
- **Build Tool**: Vite
- **Deployment**: Netlify (frontend), Heroku/Railway (chat server)

## License

This project is created for New Hope West church community.