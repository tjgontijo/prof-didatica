export function getClientUserAgent(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent
    }
    return ''
  }
  