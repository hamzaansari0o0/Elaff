import { Fraunces, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata = {
  title: 'Konava Trade Inc. | Premium Frozen Food & Groceries',
  description: 'Wholesale frozen food, agricultural products, and groceries.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${bricolage.variable}`}>
      <body className="font-bricolage antialiased bg-slate-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}