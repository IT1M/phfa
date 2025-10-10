# Mobile-Responsive Medical Archive System

## Features

### Progressive Web App (PWA)
- Installable on mobile devices
- Offline-first architecture
- Service worker for caching
- Background sync for pending uploads
- Push notifications support

### Mobile Features
- **Voice Search**: Speech-to-text for hands-free searching
- **Document Scanner**: Camera integration for scanning documents
- **Touch Optimized**: All buttons meet 44x44px minimum touch target
- **Swipe Gestures**: Navigate through cards and panels
- **Pull to Refresh**: Standard mobile refresh pattern

### Responsive Design
- **Breakpoints**: 320px, 768px, 1024px, 1440px
- **Adaptive Layouts**: Different layouts for mobile/tablet/desktop
- **Collapsible Panels**: Save screen space on mobile
- **Bottom Sheets**: Mobile-friendly modal dialogs
- **Safe Area Support**: Handles notches and rounded corners

### Performance Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Images load only when visible
- **Optimized Images**: WebP/AVIF with responsive sizes
- **Service Worker Caching**: Static assets cached offline
- **IndexedDB Storage**: Local data persistence
- **Battery Efficient**: Minimal background processing

### Offline Capabilities
- View cached documents offline
- Save drafts locally
- Queue uploads for when online
- Automatic sync when connection restored
- Offline status indicator

## Components

### Mobile Components
- `MobileNavigation` - Slide-out navigation menu
- `MobileScanner` - Camera-based document scanner
- `VoiceSearchButton` - Voice input for searches
- `TouchButton` - Touch-optimized button component
- `SwipeableCard` - Swipeable card interface
- `CollapsiblePanel` - Expandable content panels
- `BottomSheet` - Mobile modal dialogs
- `OptimizedImage` - Lazy-loaded images
- `PullToRefresh` - Pull-to-refresh functionality
- `OnlineStatusBanner` - Connection status indicator

### Hooks
- `useResponsive` - Detect device type and screen size
- `useSwipeGesture` - Handle swipe gestures
- `useVoiceInput` - Speech recognition
- `useOfflineSync` - Offline data synchronization

### Libraries
- `offline-storage.ts` - IndexedDB wrapper
- `pwa.ts` - PWA utilities

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Visit http://localhost:3000

## Building for Production

```bash
npm run build
npm start
```

## PWA Installation

### On Mobile (iOS)
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### On Mobile (Android)
1. Open in Chrome
2. Tap menu (three dots)
3. Select "Install app" or "Add to Home Screen"

### On Desktop
1. Look for install icon in address bar
2. Click to install

## Testing Offline Mode

1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. App should continue working with cached data

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers with PWA support

## Performance Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+
- Touch target size: 44x44px minimum

## Accessibility

- WCAG 2.1 AA compliant
- Touch targets meet minimum size
- Keyboard navigation support
- Screen reader compatible
- High contrast support

## Security

- HTTPS required for PWA features
- Secure camera/microphone permissions
- Local data encryption
- CSP headers configured
