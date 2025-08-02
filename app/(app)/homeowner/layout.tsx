import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default async function HomeownerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is a homeowner
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Check if user is an installer (should redirect to installer dashboard)
    const { data: installer } = await supabase
      .from('installer_users')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (installer) {
      redirect('/installer/dashboard')
    }
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}