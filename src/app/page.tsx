import { redirect } from 'next/navigation'

// Root redirects to the dashboard — SBT identity check happens in middleware
export default function RootPage() {
  redirect('/dashboard')
}
