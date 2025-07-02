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
  ct: string
  st: string
  zp: string
  country: string
  client_ip_address: string
  timestamp: number
}

export interface TrackingData {
  urlParams: UrlParams
  geoData: GeoData
  clientUserAgent: string
  externalId: string
  timestamp: string
}

export type AdvancedMatchingData = {
  ct?: string
  st?: string
  zp?: string
  country?: string
  client_ip_address?: string
  client_user_agent?: string
  external_id?: string
  fbp?: string
  fbc?: string
}
