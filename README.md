# BTC AR - Bitcoin Price Converter

A Progressive Web App (PWA) that uses your device's camera to detect prices in real-time and converts them to Bitcoin/Satoshi values using Augmented Reality overlays.

## Features

- 📱 **Mobile-First Design**: Optimized for smartphones with touch-friendly controls
- 📷 **Real-Time Camera OCR**: Uses Tesseract.js for text recognition directly in the browser
- ₿ **Live Bitcoin Prices**: Fetches real-time Bitcoin prices from CoinGecko API
- 🔄 **AR Overlays**: Displays Bitcoin/Satoshi conversions as floating overlays over detected prices
- 📴 **Offline Support**: Works offline after initial load with cached Bitcoin prices
- ⚡ **Performance Optimized**: Adaptive processing intervals and frame skipping for smooth performance
- 🎯 **PWA Ready**: Installable as a native app with service worker caching

## How It Works

1. **Point your camera** at any price (like $3.44, $15.99, etc.)
2. **OCR Detection**: The app uses Tesseract.js to recognize text from the camera feed
3. **Price Extraction**: Intelligent regex patterns identify currency amounts
4. **Bitcoin Conversion**: Converts USD amounts to Bitcoin and Satoshi values
5. **AR Display**: Shows conversions as floating overlays positioned over detected prices

## Technology Stack

- **Astro.js**: Static site generator with SPA mode
- **TypeScript**: Type-safe development
- **Tesseract.js**: Browser-based OCR engine
- **WebRTC**: Camera access via getUserMedia API
- **CoinGecko API**: Real-time Bitcoin price data
- **Service Worker**: PWA functionality and offline support

## Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

🚀 **Live at: [btcar.app](https://btcar.app)**

The app automatically deploys to GitHub Pages when you push to the main branch:

1. **Push to main/master branch**
2. **GitHub Actions builds** the Astro site
3. **Deploys to btcar.app** via GitHub Pages
4. **Custom domain** configured with CNAME

### Manual Deployment

```bash
# Build and deploy
npm run deploy
```

### Domain Setup

The custom domain `btcar.app` is configured via:
- `public/CNAME` file
- GitHub Pages settings
- DNS A records pointing to GitHub Pages IPs

## Deployment

The app is configured for GitHub Pages deployment with automatic builds via GitHub Actions.

1. Push to the `main` branch
2. GitHub Actions will build and deploy automatically
3. Access at: `https://yourusername.github.io/btc-ar`

## Browser Support

- Chrome/Edge 87+ (recommended)
- Firefox 85+
- Safari 14+
- Mobile browsers with camera support

## Privacy & Security

- **No Data Collection**: All processing happens locally in your browser
- **Camera Privacy**: Camera feed is processed locally, never transmitted
- **Offline Capable**: Works without internet after initial load
- **No Tracking**: No analytics or user tracking

## Performance Features

- Adaptive processing intervals based on device performance
- Frame skipping on slower devices
- Optimized OCR preprocessing
- Efficient Bitcoin price caching
- Memory management for long-running sessions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
