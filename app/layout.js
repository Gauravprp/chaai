import '@/app/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { Toaster } from "toastflux";
import "toastflux/styles/toast.css";

export const metadata = {
  title: 'TeamFlow AI - Enterprise Team Chat & Project Management SaaS',
  description: 'Enterprise team chat and task collaboration combined with real-time sync and AI integrations.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body suppressHydrationWarning className="antialiased bg-slate-50 text-slate-900">
        <AuthProvider>
          <WorkspaceProvider>
            {children}
            <Toaster theme="dark" />
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
