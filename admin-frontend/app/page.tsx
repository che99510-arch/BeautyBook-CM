import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token');

  // If user is authenticated, redirect to dashboard
  if (token) {
    redirect('/dashboard');
  }

  // Otherwise, redirect to login
  redirect('/login');
}
