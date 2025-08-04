import { z } from 'zod'

// Australian postcode validation
const AustralianPostcodeSchema = z.string().regex(/^[0-9]{4}$/, 'Must be a valid 4-digit postcode')

// Australian phone number validation  
const AustralianPhoneSchema = z.string().regex(/^(\+61|0)[0-9]{9}$/, 'Must be a valid Australian phone number')

// Quote request validation
export const QuoteRequestSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: AustralianPhoneSchema.optional(),
  propertyAddress: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address too long'),
  postcode: AustralianPostcodeSchema,
  state: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'], {
    message: 'Must select a valid Australian state'
  }),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'commercial'], {
    message: 'Must select a valid property type'
  }),
  roofType: z.enum(['tile', 'metal', 'flat', 'colorbond', 'concrete'], {
    message: 'Must select a valid roof type'
  }).optional(),
  annualUsage: z.number().min(1000, 'Annual usage must be at least 1000 kWh').max(50000, 'Annual usage seems too high').optional(),
  budgetRange: z.enum(['5000-10000', '10000-15000', '15000-20000', '20000-25000', '25000+'], {
    message: 'Must select a valid budget range'
  }).optional(),
})

// User registration validation
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: AustralianPhoneSchema.optional(),
  userType: z.enum(['homeowner', 'installer'], {
    message: 'Must select either homeowner or installer'
  }),
})

// Installer registration validation
export const InstallerRegistrationSchema = UserRegistrationSchema.extend({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long'),
  abn: z.string().regex(/^[0-9]{11}$/, 'ABN must be 11 digits'),
  certificationLevel: z.enum(['CEC', 'CleanEnergyCouncil', 'Other'], {
    message: 'Must select a valid certification'
  }),
  serviceAreas: z.array(z.string()).min(1, 'Must select at least one service area'),
})

// Chat message validation
export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  context: z.object({
    quoteId: z.string().uuid().optional(),
    systemSize: z.number().positive().optional(),
    propertyType: z.string().optional(),
  }).optional(),
})

// Bid submission validation
export const BidSubmissionSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
  totalCost: z.number().min(1000, 'Cost must be at least $1,000').max(100000, 'Cost seems too high'),
  systemSize: z.number().min(1, 'System size must be at least 1kW').max(50, 'System size seems too large'),
  panelBrand: z.string().min(2, 'Panel brand required').max(50, 'Panel brand too long'),
  inverterBrand: z.string().min(2, 'Inverter brand required').max(50, 'Inverter brand too long'),
  warrantyYears: z.number().min(5, 'Warranty must be at least 5 years').max(30, 'Warranty period too long'),
  installationTimeWeeks: z.number().min(1, 'Installation time must be at least 1 week').max(20, 'Installation time too long'),
  description: z.string().max(1000, 'Description too long').optional(),
})
