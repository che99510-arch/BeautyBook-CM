import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'BeautyBook Admin Dashboard',
  description: 'Admin portal for managing BeautyBook CM salon marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
