export function calculateLeads(a: number, b: number): number {
  return a + b
}

export function calculateSystemSize(monthlyUsage: number): number {
  // Rough calculation: monthly usage * 12 / 1200 (average annual generation per kW)
  const annualUsage = monthlyUsage * 12
  const estimatedSize = annualUsage / 1200
  
  // Round to common system sizes
  const commonSizes = [3, 5, 6.6, 10, 13, 15, 20]
  return commonSizes.reduce((prev, curr) => 
    Math.abs(curr - estimatedSize) < Math.abs(prev - estimatedSize) ? curr : prev
  )
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}