'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import HowItWorks from '@/components/HowItWorks'
import QuotePreview from '@/components/QuotePreview'
import RebateCalculatorForm from '@/components/RebateCalculatorForm'
import WhyChooseUs from '@/components/WhyChooseUs'
import DIYTips from '@/components/DIYTips'
import BlogSection from '@/components/BlogSection'
import GovernmentNewsSection from '@/components/GovernmentNewsSection'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'
import FloatingChat from '@/components/chat/FloatingChat'
import InstallerEligibilityForm from '@/components/installer/InstallerEligibilityForm'
import InstallerAuthModal from '@/components/installer/InstallerAuthModal'
import AccessControl from '@/components/AccessControl'

export default function HomePage() {
  const [showInstallerEligibility, setShowInstallerEligibility] = useState(false)
  const [showInstallerAuth, setShowInstallerAuth] = useState(false)

  // Listen for navigation events
  useEffect(() => {
    const handleOpenInstallerEligibility = () => {
      setShowInstallerEligibility(true)
    }

    window.addEventListener('open-installer-eligibility', handleOpenInstallerEligibility)
    
    return () => {
      window.removeEventListener('open-installer-eligibility', handleOpenInstallerEligibility)
    }
  }, [])

  const handleInstallerEligible = () => {
    setShowInstallerAuth(true)
  }

  return (
    <AccessControl>
      <div className="min-h-screen">
        <Header currentPage="home" onPageChange={() => {}} />
        <main>
          <HeroSection />
          <div id="how-it-works">
            <HowItWorks />
          </div>
          <div id="quote-preview">
            <QuotePreview />
          </div>
          <div id="rebate-calculator">
            <RebateCalculatorForm />
          </div>
          <WhyChooseUs />
          <div id="diy-tips">
            <DIYTips />
          </div>
          <div id="blog">
            <BlogSection />
          </div>
          <GovernmentNewsSection />
          <Newsletter />
        </main>
        <Footer currentPage="home" onPageChange={() => {}} />
        {/* Floating Chat Interface */}
        <FloatingChat />
        {/* Installer Eligibility Form */}
        <InstallerEligibilityForm
          isOpen={showInstallerEligibility}
          onClose={() => setShowInstallerEligibility(false)}
          onEligible={handleInstallerEligible}
        />
        {/* Installer Auth Modal */}
        <InstallerAuthModal
          isOpen={showInstallerAuth}
          onClose={() => setShowInstallerAuth(false)}
          initialMode="signup"
        />
      </div>
    </AccessControl>
  )
}
