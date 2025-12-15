import { Country, StatDefinition, Aircraft } from './types';

// --- COUNTRIES ---
export const INITIAL_CATEGORIES: string[] = [
  'Air', 'Land', 'Naval', 'Logistics', 'Financial', 'Cyber', 'Unconventional'
];

export const INITIAL_STAT_DEFINITIONS: StatDefinition[] = [
  { id: 'activePersonnel', label: 'Active Personnel', category: 'Logistics', format: 'number' },
  { id: 'reservePersonnel', label: 'Reserve Personnel', category: 'Logistics', format: 'number' },
  { id: 'defenseBudget', label: 'Defense Budget', category: 'Financial', format: 'currency' },
  { id: 'tanks', label: 'Tanks', category: 'Land', format: 'number' },
  { id: 'armoredVehicles', label: 'Armored Vehicles', category: 'Land', format: 'number' },
  { id: 'aircraftTotal', label: 'Total Aircraft', category: 'Air', format: 'number' },
  { id: 'fighters', label: 'Fighters/Interceptors', category: 'Air', format: 'number' },
  { id: 'helicopters', label: 'Helicopters', category: 'Air', format: 'number' },
  { id: 'navyTotal', label: 'Total Naval Assets', category: 'Naval', format: 'number' },
  { id: 'aircraftCarriers', label: 'Aircraft Carriers', category: 'Naval', format: 'number' },
  { id: 'submarines', label: 'Submarines', category: 'Naval', format: 'number' },
  { id: 'cyberCap', label: 'Cyber Warfare', category: 'Cyber', format: 'slider' },
  { id: 'nuclearCap', label: 'Nuclear Deterrence', category: 'Unconventional', format: 'slider' },
];

export const MOCK_COUNTRIES: Country[] = [
  {
    id: 'usa',
    name: 'United States',
    flagCode: 'us',
    rank: 1,
    score: 98.5,
    description: "The United States retains its top spot with an unmatched combination of technological prowess, massive defense budget, and global logistical reach.",
    stats: {
      activePersonnel: 1390000,
      reservePersonnel: 442000,
      defenseBudget: 877000000000,
      tanks: 5500,
      armoredVehicles: 303000,
      aircraftTotal: 13300,
      fighters: 1914,
      helicopters: 5584,
      navyTotal: 484,
      aircraftCarriers: 11,
      submarines: 68,
      cyberCap: 9.75,
      nuclearCap: 9.5
    }
  },
  {
    id: 'rus',
    name: 'Russia',
    flagCode: 'ru',
    rank: 2,
    score: 94.2,
    description: "Russia maintains a massive stockpile of armored vehicles and a powerful navy, despite recent conflicts testing its logistical capabilities.",
    stats: {
      activePersonnel: 1150000,
      reservePersonnel: 1500000,
      defenseBudget: 86000000000,
      tanks: 12566,
      armoredVehicles: 151000,
      aircraftTotal: 4182,
      fighters: 773,
      helicopters: 1531,
      navyTotal: 598,
      aircraftCarriers: 1,
      submarines: 70,
      cyberCap: 8.5,
      nuclearCap: 10
    }
  },
  {
    id: 'chn',
    name: 'China',
    flagCode: 'cn',
    rank: 3,
    score: 92.8,
    description: "China continues its rapid naval expansion and modernization of its air force, aiming for global power projection capabilities.",
    stats: {
      activePersonnel: 2000000,
      reservePersonnel: 510000,
      defenseBudget: 292000000000,
      tanks: 4950,
      armoredVehicles: 174000,
      aircraftTotal: 3284,
      fighters: 1199,
      helicopters: 913,
      navyTotal: 730,
      aircraftCarriers: 3,
      submarines: 78,
      cyberCap: 9.25,
      nuclearCap: 8.0
    }
  },
  {
    id: 'ind',
    name: 'India',
    flagCode: 'in',
    rank: 4,
    score: 86.5,
    description: "India boasts a massive manpower pool and a growing indigenous defense industry, acting as a major regional stabilizer.",
    stats: {
      activePersonnel: 1450000,
      reservePersonnel: 1155000,
      defenseBudget: 81000000000,
      tanks: 4614,
      armoredVehicles: 100000,
      aircraftTotal: 2210,
      fighters: 577,
      helicopters: 807,
      navyTotal: 295,
      aircraftCarriers: 2,
      submarines: 18,
      cyberCap: 7.5,
      nuclearCap: 7.75
    }
  },
  {
    id: 'kor',
    name: 'South Korea',
    flagCode: 'kr',
    rank: 5,
    score: 82.1,
    description: "Technologically advanced and heavily fortified, South Korea maintains high readiness due to regional tensions.",
    stats: {
      activePersonnel: 555000,
      reservePersonnel: 3100000,
      defenseBudget: 46400000000,
      tanks: 2331,
      armoredVehicles: 133000,
      aircraftTotal: 1602,
      fighters: 402,
      helicopters: 739,
      navyTotal: 157,
      aircraftCarriers: 2, 
      submarines: 22,
      cyberCap: 8.25,
      nuclearCap: 1.0
    }
  },
  {
    id: 'gbr',
    name: 'United Kingdom',
    flagCode: 'gb',
    rank: 6,
    score: 79.4,
    description: "The UK focuses on elite training, advanced intelligence, and power projection via its Queen Elizabeth-class carriers.",
    stats: {
      activePersonnel: 194000,
      reservePersonnel: 37000,
      defenseBudget: 68000000000,
      tanks: 227,
      armoredVehicles: 73000,
      aircraftTotal: 663,
      fighters: 119,
      helicopters: 284,
      navyTotal: 73,
      aircraftCarriers: 2,
      submarines: 10,
      cyberCap: 8.75,
      nuclearCap: 7.5
    }
  },
];

// --- AIRCRAFT ---
export const INITIAL_AIRCRAFT_CATEGORIES: string[] = [
    'Performance', 'Stealth', 'Armament', 'Avionics', 'Cost'
];

export const INITIAL_AIRCRAFT_STAT_DEFINITIONS: StatDefinition[] = [
    { id: 'maxSpeed', label: 'Max Speed (Mach)', category: 'Performance', format: 'number' },
    { id: 'combatRange', label: 'Combat Range (km)', category: 'Performance', format: 'number' },
    { id: 'serviceCeiling', label: 'Service Ceiling (ft)', category: 'Performance', format: 'number' },
    { id: 'stealthRating', label: 'Stealth Rating', category: 'Stealth', format: 'slider' },
    { id: 'rcs', label: 'Radar Cross Section (m²)', category: 'Stealth', format: 'number' },
    { id: 'hardpoints', label: 'Hardpoints', category: 'Armament', format: 'number' },
    { id: 'payload', label: 'Payload Capacity (kg)', category: 'Armament', format: 'number' },
    { id: 'radarRange', label: 'Radar Detection Range', category: 'Avionics', format: 'slider' },
    { id: 'ewSuite', label: 'Electronic Warfare Suite', category: 'Avionics', format: 'slider' },
    { id: 'unitCost', label: 'Unit Cost', category: 'Cost', format: 'currency' },
];

export const MOCK_AIRCRAFT: Aircraft[] = [
    {
        id: 'f22',
        name: 'F-22 Raptor',
        origin: 'USA',
        rank: 1,
        score: 99.0,
        description: "The premier 5th-generation air superiority fighter, renowned for its stealth, supercruise, and thrust vectoring capabilities.",
        stats: {
            maxSpeed: 2.25,
            combatRange: 850,
            serviceCeiling: 65000,
            stealthRating: 10.0,
            rcs: 0.0001,
            hardpoints: 4, // Internal main bays + side
            payload: 2270, // Internal
            radarRange: 9.5,
            ewSuite: 9.0,
            unitCost: 150000000
        }
    },
    {
        id: 'j20',
        name: 'Chengdu J-20',
        origin: 'China',
        rank: 2,
        score: 94.5,
        description: "China's heavy 5th-generation stealth fighter, designed for long-range interception and strike missions.",
        stats: {
            maxSpeed: 2.0,
            combatRange: 2000,
            serviceCeiling: 66000,
            stealthRating: 8.5,
            rcs: 0.01,
            hardpoints: 6,
            payload: 11000,
            radarRange: 9.0,
            ewSuite: 8.5,
            unitCost: 110000000
        }
    },
    {
        id: 'su57',
        name: 'Sukhoi Su-57',
        origin: 'Russia',
        rank: 3,
        score: 91.0,
        description: "A multirole 5th-generation fighter combining extreme maneuverability with stealth characteristics and heavy armament.",
        stats: {
            maxSpeed: 2.0,
            combatRange: 1500,
            serviceCeiling: 66000,
            stealthRating: 7.5,
            rcs: 0.1,
            hardpoints: 10,
            payload: 10000,
            radarRange: 8.5,
            ewSuite: 8.0,
            unitCost: 40000000
        }
    },
    {
        id: 'rafale',
        name: 'Dassault Rafale',
        origin: 'France',
        rank: 4,
        score: 88.5,
        description: "A highly versatile omnirole 4.5 generation fighter with advanced avionics (SPECTRA) and nuclear capability.",
        stats: {
            maxSpeed: 1.8,
            combatRange: 1850,
            serviceCeiling: 50000,
            stealthRating: 5.5,
            rcs: 1.0,
            hardpoints: 14,
            payload: 9500,
            radarRange: 8.0,
            ewSuite: 9.5,
            unitCost: 115000000
        }
    }
];