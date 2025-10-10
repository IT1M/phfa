# Medical Archive - Modern Web Application

A modern, accessible medical document management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- ✅ **Guest Access System** - Elegant modal with email validation and 30-day session management
- ✅ **RTL Support** - Seamless Arabic/English language switching
- ✅ **Saudi-Themed UI** - Green (#006C35) and white color scheme
- ✅ **Dark/Light Mode** - System-aware theme switching
- ✅ **Progressive Web App** - Installable with offline support
- ✅ **Redux Toolkit** - Centralized state management
- ✅ **Google Gemini AI** - Medical text processing with bilingual support

### Pages
1. **Landing Page** - Value proposition with guest access CTA
2. **Dashboard** - Document upload and management
3. **Search Page** - Advanced filters and natural language search
4. **Document Viewer** - (Ready for implementation)
5. **Admin Panel** - (Ready for implementation)
6. **User Profile** - (Ready for implementation)

### Accessibility
- WCAG 2.1 AAA compliance ready
- Screen reader optimization
- Keyboard navigation support
- High contrast mode
- Reduced motion support

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PWA**: next-pwa

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL
- **API**: GraphQL + REST
- **AI**: Google Gemini Pro
- **OCR**: Tesseract.js
- **Authentication**: JWT

## Getting Started

### Frontend Installation

```bash
npm install
```

### Frontend Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Backend Installation

```bash
cd backend
npm install
```

### Backend Development

```bash
cd backend
npm run dev
```

Backend runs on [http://localhost:5000](http://localhost:5000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
medical-archive/
├── public/
│   ├── icons/              # PWA icons
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── dashboard/      # Dashboard page
│   │   ├── search/         # Search page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── common/         # Shared components
│   │   ├── guest/          # Guest modal
│   │   ├── dashboard/      # Dashboard components
│   │   └── search/         # Search components
│   ├── store/
│   │   ├── slices/         # Redux slices
│   │   └── index.ts        # Store configuration
│   ├── lib/
│   │   ├── utils.ts        # Utility functions
│   │   └── storage.ts      # LocalStorage helpers
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript types
└── package.json
```

## Key Features Implementation

### Guest Access Modal
- Real-time email validation
- Privacy policy checkbox
- 30-day session management
- Auto-redirect to dashboard
- LocalStorage persistence

### Language Switching
- English/Arabic support
- RTL layout for Arabic
- Cairo font for Arabic text
- Seamless switching without reload

### Theme System
- Light/dark mode toggle
- System preference detection
- Persistent theme selection
- Smooth transitions

### Search Interface
- Natural language search bar
- Voice input support (ready)
- Auto-suggestions (ready)
- Advanced filters panel
- Search history with privacy controls

## Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medical_docs
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=AIzaSyCV3Kb2rHMQoyAiYkrAFA82UlcGbYAAC0M
CORS_ORIGIN=http://localhost:3000
```

## PWA Configuration

The app is configured as a Progressive Web App with:
- Service worker for offline support
- Installable on mobile and desktop
- App manifest with Saudi theme colors
- Icon sets for all platforms

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Focus management
- Keyboard shortcuts
- Screen reader announcements
- High contrast mode support
- Reduced motion support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your needs.

## Google Gemini AI Integration

The system includes comprehensive AI-powered medical text processing:

### Features
- **Medical Entity Extraction** - Automatically extract patient info, diagnoses, medications, lab results
- **Natural Language Search** - Parse Arabic/English queries into structured filters
- **Document Summarization** - Generate clinical summaries with key findings
- **Bilingual Translation** - Translate medical text between Arabic and English
- **ICD-10 Coding** - Automatic diagnosis code mapping
- **Term Normalization** - Standardize Arabic medical terminology

### Quick Start
```bash
cd backend
npx ts-node test-gemini.ts
```

### Documentation
- **Full Guide**: `backend/GEMINI_INTEGRATION.md`
- **Quick Reference**: `backend/QUICK_REFERENCE.md`
- **Examples**: `backend/src/examples/gemini-usage.ts`

## Next Steps

To complete the application:

1. **Document Viewer** - Implement PDF viewer with annotation capabilities
2. **Admin Panel** - Build visitor analytics and management dashboard
3. **User Profile** - Create settings and profile management
4. **Voice Search** - Implement Web Speech API
5. **Testing** - Add unit and integration tests
6. **AI Caching** - Implement Redis for Gemini response caching
7. **Monitoring** - Set up API usage tracking and alerts

## Support

For issues and questions, please open an issue on GitHub.
