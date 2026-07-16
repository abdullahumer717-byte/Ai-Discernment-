import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'AI Discernment Coach',
  description: 'Practice Product, Process, and Performance Discernment by evaluating and refining AI-generated content in your area of expertise.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="bg-[#FAF9F6] text-[#1E1E1E] antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
