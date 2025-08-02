import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default async function InstallerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is an installer
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Check if user is an installer
    const { data: installer } = await supabase
      .from('installer_users')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (!installer) {
      redirect('/homeowner/dashboard')
    }
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}