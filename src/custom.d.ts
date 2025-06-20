export {};
declare global {
  interface Window {
    // Definições existentes
    pixelId: string;
    sha256: (input: string) => string;
    fbq?: (
      type: 'track' | 'trackCustom',
      eventName: string,
      data?: Record<string, string | number | undefined>,
    ) => void;
    
    // Novas definições para UTMify
    utmifyConfig?: {
      apiUrl: string;
    };
    utmify?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
      init?: (config?: Record<string, unknown>) => void;
    };
  }
}
