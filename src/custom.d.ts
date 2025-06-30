export {};

// Interface para os dados de advanced matching do Facebook Pixel
interface FacebookAdvancedMatchingData {
  em?: string;       // email
  ph?: string;       // phone
  fn?: string;       // first name
  ln?: string;       // last name
  ct?: string;       // city
  st?: string;       // state
  zp?: string;       // zip code
  country?: string;  // country
  external_id?: string; // external ID
}

// Interface para os dados de eventos do Facebook Pixel
interface FacebookEventData {
  event_id?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  currency?: string;
  value?: number;
  [key: string]: string | number | string[] | undefined;
}

declare global {
  interface Window {
    // Definições para o Facebook Pixel
    pixelId: string;
    sha256: (input: string) => string;
    // Definição da função fbq do Facebook Pixel
    fbq?: {
      (type: 'track' | 'trackCustom', eventName: string, data?: FacebookEventData): void;
      (type: 'init', pixelId: string, advancedMatchingData?: FacebookAdvancedMatchingData): void;
    };
  }
}
