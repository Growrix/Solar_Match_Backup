import NewQuoteForm from '@/components/homeowner/NewQuoteForm'

export default function RequestQuote() {
  return (
    <section className="bg-gradient-to-br from-black-500 to-night-500 py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Request a Solar Quote
            </h1>
            <p className="text-xl text-battleship_gray-700">
              Get personalized quotes from verified local installers in under 2 minutes
            </p>
          </div>
          <NewQuoteForm />
        </div>
      </div>
    </section>
  )
}