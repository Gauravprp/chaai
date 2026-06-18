# Dyzo Developer API Documentation - Next.js

A modern, server-side rendered Next.js application for the Dyzo Developer Portal API documentation.

## Features

- **Server-Side Rendering (SSR)** - Fast initial page loads with SEO benefits
- **TypeScript** - Full type safety throughout the application
- **Dynamic API Documentation** - Fetches documentation from backend API
- **Interactive Code Examples** - Multiple languages (JavaScript, Python, cURL)
- **Authentication Methods** - API Keys, JWT tokens, OTP, OAuth
- **Modern UI** - Dark theme with Tailwind CSS 4
- **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Iconify React** - Icon library

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.dyzo.ai
```

Replace with your actual Django backend URL if different.

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
developer-api-nextjs/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/
│   │   └── Icon.tsx        # Icon wrapper component
│   ├── ApiDocumentation.tsx    # Main documentation component
│   ├── GettingStartedDynamic.tsx
│   ├── DynamicEndpoint.tsx
│   └── AuthenticationAPI.tsx
├── services/
│   └── apiDocumentationService.ts  # API service layer
├── public/
│   ├── dyzo-ai-logo.png
│   └── robots.txt
└── package.json
```

## Key Differences from Vite Version

### Advantages of Next.js Version

1. **Server-Side Rendering** - Better SEO and faster initial loads
2. **TypeScript** - Full type safety and better developer experience
3. **App Router** - Modern Next.js routing with layouts
4. **Image Optimization** - Automatic image optimization with next/image
5. **API Routes** - Can add backend API routes if needed
6. **Production Ready** - Built-in optimization and best practices

### Migration Notes

- Converted all `.jsx` files to `.tsx` with proper TypeScript types
- Replaced React Router with Next.js App Router
- Converted `import.meta.env` to `process.env.NEXT_PUBLIC_*`
- Added proper TypeScript interfaces for all data structures
- Implemented proper Next.js metadata for SEO
- Used Next.js Image component for optimized images

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Base URL for the API (default: https://api.dyzo.ai)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the application and deploy the `.next` folder:

```bash
npm run build
```

## Features

### Dynamic Documentation System
- Fetches documentation from backend API
- Falls back to mock data during development
- Organized by categories and endpoints

### Interactive Code Examples
- Multiple programming languages
- Copy-to-clipboard functionality
- Syntax-highlighted JSON
- Line numbers for better readability

### Authentication Documentation
- API Key authentication
- JWT token authentication with auto-refresh
- OTP login
- Google OAuth and Apple Sign-In

### Modern UI/UX
- Dark theme with gradient backgrounds
- Glassmorphism effects
- Color-coded HTTP methods
- Custom scrollbars
- Smooth animations and transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - Dyzo AI

## Notes

- The application uses `localStorage` for demonstration purposes
- For production, consider using HTTP-only cookies for tokens
- All API calls use the `NEXT_PUBLIC_API_BASE_URL` environment variable
- The app includes proper SEO metadata and robots.txt
