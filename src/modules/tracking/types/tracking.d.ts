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
  city?: string
  region?: string
  zip?: string
  country?: string
  clientIpAddress?: string
  clientUserAgent?: string
  externalId?: string
  fbp?: string
  fbc?: string
}
