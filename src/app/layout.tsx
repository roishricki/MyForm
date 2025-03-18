import "./globals.css";
import { Ubuntu } from 'next/font/google';

const ubuntu = Ubuntu({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ubuntu.className}>
      <body>
        {children}
      </body>
    </html>
  );
}
