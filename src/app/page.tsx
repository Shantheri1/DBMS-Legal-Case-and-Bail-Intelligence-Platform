import { redirect } from 'next/navigation';

export default function RootPage() {
  // Direct portal entry: Redirect to login by default
  redirect('/login');
}
