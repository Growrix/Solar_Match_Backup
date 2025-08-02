import { rebatePrograms, lookupZoneRating, getStateFromPostcode, type RebateCalculationResult } from '@/data/rebatePrograms';

export interface CalculationInputs {
  systemSizeKw: number;
  postcode: string;
  installationYear: number;
  ownerOccupier: boolean;
  householdIncome: number;
  propertyValue: number;
  includeBattery: boolean;
}

export class RebateCalculator {
  static calculate(inputs: CalculationInputs): RebateCalculationResult {
    const state = getStateFromPostcode(inputs.postcode);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const result: RebateCalculationResult = {
      breakdown: {
        federal: {},
        state: {}
      },
      total_rebate: 0,
      disclaimers: [],
      region_notes: {}
    };

    // Calculate federal rebates
    this.calculateFederalRebates(inputs, result);
    
    // Calculate state rebates
    this.calculateStateRebates(inputs, state, result);
    
    // Calculate total
    result.total_rebate = this.calculateTotal(result);
    
    // Add disclaimers and notes
    this.addDisclaimersAndNotes(result, state);
    
    return result;
  }

  private static calculateFederalRebates(inputs: CalculationInputs, result: RebateCalculationResult) {
    // STC Calculation
    const stcProgram = rebatePrograms.find(p => p.id === 'sres_stc');
    if (stcProgram && this.isProgramValid(stcProgram)) {
      const deemingPeriod = Math.max(0, 2030 - inputs.installationYear);
      const zoneRating = lookupZoneRating(inputs.postcode);
      const stcPrice = stcProgram.calculation?.variables.stc_price || 35;
      
      // STC formula: system_size_kW * deeming_period * zone_rating * stc_price
      const stcAmount = Math.round(inputs.systemSizeKw * deemingPeriod * zoneRating * stcPrice);
      result.breakdown.federal.stc_amount = stcAmount;
    }

    // Federal Battery Rebate
    if (inputs.includeBattery) {
      const batteryProgram = rebatePrograms.find(p => p.id === 'federal_battery_rebate');
      if (batteryProgram && this.isProgramValid(batteryProgram)) {
        result.breakdown.federal.battery_rebate = batteryProgram.amount || 0;
      }
    }
  }

  private static calculateStateRebates(inputs: CalculationInputs, state: string, result: RebateCalculationResult) {
    const statePrograms = rebatePrograms.filter(p => 
      p.jurisdiction === 'state' && 
      p.state === state && 
      this.isProgramValid(p)
    );

    for (const program of statePrograms) {
      if (this.isEligible(inputs, program)) {
        const amount = program.amount || 0;
        
        if (program.type === 'solar' && !inputs.includeBattery) {
          result.breakdown.state[state] = (result.breakdown.state[state] || 0) + amount;
        } else if (program.type === 'battery' && inputs.includeBattery) {
          result.breakdown.state[state] = (result.breakdown.state[state] || 0) + amount;
        }
      }
    }
  }

  private static isProgramValid(program: any): boolean {
    const currentDate = new Date();
    const startDate = new Date(program.validity.start);
    const endDate = new Date(program.validity.end);
    
    return currentDate >= startDate && currentDate <= endDate;
  }

  private static isEligible(inputs: CalculationInputs, program: any): boolean {
    const eligibility = program.eligibility;
    
    // Check owner occupier requirement
    if (eligibility.owner_occupier && !inputs.ownerOccupier) {
      return false;
    }
    
    // Check income limit
    if (eligibility.income_max && inputs.householdIncome > eligibility.income_max) {
      return false;
    }
    
    // Check property value limit
    if (eligibility.property_value_max && inputs.propertyValue > eligibility.property_value_max) {
      return false;
    }
    
    // Check system size limit
    if (eligibility.system_size_max_kW && inputs.systemSizeKw > eligibility.system_size_max_kW) {
      return false;
    }
    
    return true;
  }

  private static calculateTotal(result: RebateCalculationResult): number {
    let total = 0;
    
    // Add federal rebates
    total += result.breakdown.federal.stc_amount || 0;
    total += result.breakdown.federal.battery_rebate || 0;
    
    // Add state rebates
    Object.values(result.breakdown.state).forEach(amount => {
      total += amount;
    });
    
    return total;
  }

  private static addDisclaimersAndNotes(result: RebateCalculationResult, state: string) {
    // Standard disclaimers
    result.disclaimers = [
      "STC value fluctuates based on market conditions; final quote may vary.",
      "All rebates require CEC-approved installers and compliant equipment.",
      "State rebates are subject to funding availability and may close without notice.",
      "Eligibility criteria must be met at time of installation.",
      "This is an estimate only - consult with your installer for accurate rebate calculations."
    ];

    // State-specific notes
    result.region_notes = {
      'ACT': "Interest-free loans available via Sustainable Household Scheme instead of rebates.",
      'WA': "Battery rebate programs expected to launch in 2025; check for updates.",
      'NT': "Limited rebate programs available; focus on federal incentives.",
      'TAS': "Additional rebates may be available through local councils."
    };

    // Add federal battery rebate disclaimer if applicable
    if (result.breakdown.federal.battery_rebate) {
      result.disclaimers.push("Federal battery rebate valid only for installations after July 1, 2025.");
    }
  }

  // Helper method to get available programs for a location
  static getAvailablePrograms(postcode: string): any[] {
    const state = getStateFromPostcode(postcode);
    return rebatePrograms.filter(p => 
      (p.jurisdiction === 'federal' || p.state === state) && 
      this.isProgramValid(p)
    );
  }

  // Helper method to estimate system size based on usage
  static estimateSystemSize(monthlyUsageKwh: number): number {
    // Rough calculation: monthly usage * 12 / 1200 (average annual generation per kW)
    const annualUsage = monthlyUsageKwh * 12;
    const estimatedSize = annualUsage / 1200;
    
    // Round to common system sizes
    const commonSizes = [3, 5, 6.6, 10, 13, 15, 20];
    return commonSizes.reduce((prev, curr) => 
      Math.abs(curr - estimatedSize) < Math.abs(prev - estimatedSize) ? curr : prev
    );
  }
}