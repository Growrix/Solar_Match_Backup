import { supabase } from '@/lib/supabase';

export interface QuoteSettings {
  base_price_per_kw: number;
  federal_rebate_per_kw: number;
  battery_cost: number;
  rebates_enabled: boolean;
  qld_rebate_enabled: boolean;
  qld_state_rebate: number;
  default_price_per_kwh: number;
}

export interface QuoteCalculationInputs {
  monthlyKwh?: number;
  billAmount?: number;
  postcode: string;
  state: string;
  location: string;
  roofType?: string;
  budgetRange: string;
  batteryIncluded: boolean;
}

export interface QuoteCalculationResult {
  systemSize: number;
  totalCost: number;
  federalRebate: number;
  stateRebate: number;
  finalPrice: number;
  batteryIncluded: boolean;
  budgetRange: string;
  disclaimers: string[];
}

// Default settings in case database fetch fails
const DEFAULT_SETTINGS: QuoteSettings = {
  base_price_per_kw: 1100,
  federal_rebate_per_kw: 500,
  battery_cost: 4500,
  rebates_enabled: true,
  qld_rebate_enabled: true,
  qld_state_rebate: 1000,
  default_price_per_kwh: 0.28
};

// Fetch quote settings from the database
export const getQuoteSettings = async (): Promise<QuoteSettings> => {
  try {
    const { data, error } = await supabase
      .from('quote_settings')
      .select('key, value');

    if (error) {
      console.error('Error fetching quote settings:', error);
      return DEFAULT_SETTINGS;
    }

    if (!data || data.length === 0) {
      console.warn('No quote settings found, using defaults');
      return DEFAULT_SETTINGS;
    }

    // Convert array of {key, value} to settings object
    const settings: Record<string, string> = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });

    return {
      base_price_per_kw: parseFloat(settings.base_price_per_kw || DEFAULT_SETTINGS.base_price_per_kw.toString()),
      federal_rebate_per_kw: parseFloat(settings.federal_rebate_per_kw || DEFAULT_SETTINGS.federal_rebate_per_kw.toString()),
      battery_cost: parseFloat(settings.battery_cost || DEFAULT_SETTINGS.battery_cost.toString()),
      rebates_enabled: settings.rebates_enabled === 'true',
      qld_rebate_enabled: settings.qld_rebate_enabled === 'true',
      qld_state_rebate: parseFloat(settings.qld_state_rebate || DEFAULT_SETTINGS.qld_state_rebate.toString()),
      default_price_per_kwh: parseFloat(settings.default_price_per_kwh || DEFAULT_SETTINGS.default_price_per_kwh.toString())
    };
  } catch (error) {
    console.error('Unexpected error fetching quote settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Calculate solar quote based on inputs and settings
export const calculateSolarQuote = async (inputs: QuoteCalculationInputs): Promise<QuoteCalculationResult> => {
  // Fetch settings from database
  const settings = await getQuoteSettings();
  
  // Calculate monthly kWh if not provided
  let monthlyKwh = inputs.monthlyKwh;
  if (!monthlyKwh && inputs.billAmount) {
    monthlyKwh = inputs.billAmount / settings.default_price_per_kwh;
  }
  
  // Default to 800 kWh if no usage data provided
  monthlyKwh = monthlyKwh || 800;
  
  // Calculate system size based on monthly usage
  let systemSize = monthlyKwh / 110;
  
  // Round to nearest common system size
  const commonSizes = [3, 5, 6.6, 10, 13, 15, 20];
  systemSize = commonSizes.reduce((prev, curr) => 
    Math.abs(curr - systemSize) < Math.abs(prev - systemSize) ? curr : prev, 
    commonSizes[0]
  );
  
  // Calculate total cost
  let totalCost = systemSize * settings.base_price_per_kw;
  
  // Add battery cost if included
  if (inputs.batteryIncluded) {
    totalCost += settings.battery_cost;
  }
  
  // Calculate federal rebate
  let federalRebate = 0;
  if (settings.rebates_enabled) {
    federalRebate = systemSize * settings.federal_rebate_per_kw;
  }
  
  // Calculate state rebate
  let stateRebate = 0;
  if (settings.rebates_enabled && inputs.state === 'QLD' && settings.qld_rebate_enabled) {
    stateRebate = settings.qld_state_rebate;
  }
  
  // Calculate final price
  const finalPrice = Math.max(0, totalCost - federalRebate - stateRebate);
  
  // Generate disclaimers
  const disclaimers = [
    "STC value varies; final quote may differ by ±10%.",
    `${inputs.state} rebates require owner-occupier status and income eligibility.`,
    "Battery rebates valid for installations after July 2025.",
    "Final pricing depends on roof complexity and installer selection.",
    "This is an estimate only - get detailed quotes from certified installers."
  ];
  
  return {
    systemSize,
    totalCost,
    federalRebate,
    stateRebate,
    finalPrice,
    batteryIncluded: inputs.batteryIncluded,
    budgetRange: inputs.budgetRange,
    disclaimers
  };
};

// Update a quote setting (for admin use)
export const updateQuoteSetting = async (key: string, value: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('quote_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) {
      console.error('Error updating quote setting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating quote setting:', error);
    return false;
  }
};