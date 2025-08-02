'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/common/AuthModal'

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()

  const handleClose = () => {
    setIsOpen(false)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500 flex items-center justify-center">
      <AuthModal
        isOpen={isOpen}
        onClose={handleClose}
        initialMode="signin"
      />
    </div>
  )
}