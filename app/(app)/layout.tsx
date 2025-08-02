import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication check
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500">
      {children}
    </div>
  )
}