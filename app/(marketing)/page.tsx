import HeroSection from '@/components/common/HeroSection'
import HowItWorks from '@/components/common/HowItWorks'
import QuotePreview from '@/components/common/QuotePreview'
import RebateCalculatorForm from '@/components/common/RebateCalculatorForm'
import WhyChooseUs from '@/components/WhyChooseUs'
import DIYTips from '@/components/DIYTips'
import BlogSection from '@/components/BlogSection'
import GovernmentNewsSection from '@/components/common/GovernmentNewsSection'
import Newsletter from '@/components/common/Newsletter'
import FloatingChat from '@/components/common/FloatingChat'

export default function HomePage() {
  return (
    <>
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
      
      {/* Floating Chat Interface */}
      <FloatingChat />
    </>
  )
}