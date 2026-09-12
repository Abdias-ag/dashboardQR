import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'QR Platform - Dynamisez vos QR Codes',
  description: 'Générez, personnalisez et analysez vos QR Codes dynamiques en temps réel.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
