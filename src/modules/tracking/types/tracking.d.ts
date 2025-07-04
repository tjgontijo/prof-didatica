export interface UrlParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  fbclid?: string
  gclid?: string
  sck?: string
  src?: string
  fbp?: string
  fbc?: string
}

export interface GeoData {
  city: string
  region: string
  zip: string
  country: string
  clientIpAddress: string
  lat?: number
  lon?: number
  timestamp: number
}

export interface TrackingData {
  sessionId: string;
  userAgent: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  landingPage?: string;
  ip?: string;
  city?: string;
  region?: string;
  zip?: string;
  country?: string;
  lat?: number;
  lon?: number;
  timestamp: string;
}

export type AdvancedMatchingData = {
  em?: string;      // Email
  fn?: string;      // First Name
  ln?: string;      // Last Name
  ph?: string;      // Phone
  external_id?: string; // External ID
  ge?: 'f' | 'm'; // Gender
  db?: string;      // Date of Birth (YYYYMMDD)
  ct?: string;      // City
  st?: string;      // State (2-letter code)
  zp?: string;      // Zip Code
  country?: string; // Country (2-letter code)
};
