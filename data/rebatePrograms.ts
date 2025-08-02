export interface RebateProgram {
  id: string;
  name: string;
  jurisdiction: 'federal' | 'state';
  state?: string;
  type: string;
  validity: {
    start: string;
    end: string;
  };
  calculation?: {
    formula: string;
    variables: {
      deeming_period?: string;
      zone_rating?: string;
      stc_price?: number;
    };
  };
  amount?: number;
  eligibility: {
    installer?: string;
    system_size_max_kW?: number;
    owner_occupier?: boolean;
    income_max?: number;
    property_value_max?: number;
  };
}

export interface ZoneRating {
  [postcode: string]: number;
}

export interface RebateCalculationResult {
  breakdown: {
    federal: {
      stc_amount?: number;
      battery_rebate?: number;
    };
    state: {
      [state: string]: number;
    };
  };
  total_rebate: number;
  disclaimers: string[];
  region_notes: {
    [state: string]: string;
  };
}

// Zone ratings for STC calculation (sample data - you can expand this)
export const zoneRatings: ZoneRating = {
  // NSW
  '2000': 1.382, // Sydney
  '2001': 1.382,
  '2010': 1.382,
  '2020': 1.382,
  '2030': 1.382,
  '2040': 1.382,
  '2050': 1.382,
  '2060': 1.382,
  '2070': 1.382,
  '2080': 1.382,
  '2090': 1.382,
  '2100': 1.382,
  
  // VIC
  '3000': 1.382, // Melbourne
  '3001': 1.382,
  '3002': 1.382,
  '3003': 1.382,
  '3004': 1.382,
  '3005': 1.382,
  '3006': 1.382,
  '3008': 1.382,
  
  // QLD
  '4000': 1.536, // Brisbane
  '4001': 1.536,
  '4002': 1.536,
  '4003': 1.536,
  '4004': 1.536,
  '4005': 1.536,
  '4006': 1.536,
  
  // WA
  '6000': 1.536, // Perth
  '6001': 1.536,
  '6002': 1.536,
  '6003': 1.536,
  '6004': 1.536,
  '6005': 1.536,
  
  // SA
  '5000': 1.382, // Adelaide
  '5001': 1.382,
  '5002': 1.382,
  '5003': 1.382,
  '5004': 1.382,
  '5005': 1.382,
  
  // TAS
  '7000': 1.185, // Hobart
  '7001': 1.185,
  '7002': 1.185,
  '7003': 1.185,
  '7004': 1.185,
  
  // ACT
  '2600': 1.382, // Canberra
  '2601': 1.382,
  '2602': 1.382,
  '2603': 1.382,
  '2604': 1.382,
  
  // NT
  '0800': 1.536, // Darwin
  '0801': 1.536,
  '0802': 1.536,
  '0803': 1.536,
  '0804': 1.536,
};

// Rebate programs data
export const rebatePrograms: RebateProgram[] = [
  {
    id: "sres_stc",
    name: "Small-scale Renewable Energy Scheme (STCs)",
    jurisdiction: "federal",
    type: "solar",
    validity: { start: "2011-01-01", end: "2030-12-31" },
    calculation: {
      formula: "system_size_kW * deeming_period * zone_rating * stc_price",
      variables: {
        deeming_period: "2030 - installation_year",
        zone_rating: "lookup_postcode(postcode)",
        stc_price: 35
      }
    },
    eligibility: {
      installer: "CEC-accredited",
      system_size_max_kW: 100
    }
  },
  {
    id: "vic_solar_homes",
    name: "VIC Solar Homes Program",
    jurisdiction: "state",
    state: "VIC",
    type: "solar",
    validity: { start: "2025-01-01", end: "2025-12-31" },
    amount: 1400,
    eligibility: {
      owner_occupier: true,
      income_max: 180000,
      property_value_max: 3000000
    }
  },
  {
    id: "nsw_empowering_homes",
    name: "NSW Empowering Homes Program",
    jurisdiction: "state",
    state: "NSW",
    type: "solar",
    validity: { start: "2024-11-01", end: "2025-12-31" },
    amount: 1200,
    eligibility: {
      owner_occupier: true,
      income_max: 180000,
      property_value_max: 1500000
    }
  },
  {
    id: "qld_battery_booster",
    name: "QLD Battery Booster Program",
    jurisdiction: "state",
    state: "QLD",
    type: "battery",
    validity: { start: "2024-07-01", end: "2025-06-30" },
    amount: 3000,
    eligibility: {
      owner_occupier: true,
      income_max: 180000
    }
  },
  {
    id: "sa_home_battery",
    name: "SA Home Battery Scheme",
    jurisdiction: "state",
    state: "SA",
    type: "battery",
    validity: { start: "2024-01-01", end: "2025-12-31" },
    amount: 3000,
    eligibility: {
      owner_occupier: true,
      income_max: 100000
    }
  },
  {
    id: "federal_battery_rebate",
    name: "Federal Battery Rebate",
    jurisdiction: "federal",
    type: "battery",
    validity: { start: "2025-07-01", end: "2030-12-31" },
    amount: 3300,
    eligibility: {
      installer: "CEC-accredited"
    }
  }
];

// Helper function to lookup zone rating by postcode
export const lookupZoneRating = (postcode: string): number => {
  return zoneRatings[postcode] || 1.382; // Default to zone 4 if not found
};

// Helper function to get state from postcode
export const getStateFromPostcode = (postcode: string): string => {
  const code = parseInt(postcode);
  
  if (code >= 1000 && code <= 2999) return 'NSW';
  if (code >= 3000 && code <= 3999) return 'VIC';
  if (code >= 4000 && code <= 4999) return 'QLD';
  if (code >= 5000 && code <= 5999) return 'SA';
  if (code >= 6000 && code <= 6999) return 'WA';
  if (code >= 7000 && code <= 7999) return 'TAS';
  if (code >= 800 && code <= 999) return 'NT';
  if (code >= 2600 && code <= 2699) return 'ACT';
  
  return 'NSW'; // Default
};