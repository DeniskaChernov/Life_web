export const PROPERTY_TYPE_VALUES = ["apartment", "house", "commercial", "land"] as const;
export type PropertyType = (typeof PROPERTY_TYPE_VALUES)[number];

export const PROPERTY_LIFECYCLE_VALUES = [
  "PLANNING",
  "SEARCHING",
  "OWNED",
  "RENTING_OUT",
  "SELLING",
  "SOLD",
] as const;
export type PropertyLifecycleStatus = (typeof PROPERTY_LIFECYCLE_VALUES)[number];

export interface PropertyAddress {
  country?: string;
  city?: string;
  district?: string;
  street?: string;
  building?: string;
  unit?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}

export interface PropertyInput {
  nodeId: string;
  type: PropertyType;
  address: PropertyAddress;
  areaSqm?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currentEstimatedValue?: number;
  lastValuationDate?: string;
  mortgageData?: unknown;
  rentalData?: unknown;
  monthlyExpenses?: unknown;
  lifecycleStatus?: PropertyLifecycleStatus;
}
