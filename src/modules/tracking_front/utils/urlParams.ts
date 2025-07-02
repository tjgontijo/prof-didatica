import { UrlParams } from '../types/tracking'

export function getUrlParams(): UrlParams {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  const getCookie = (name: string): string | undefined => {
    const cookies = document.cookie.split(';')
    const match = cookies.find(c => c.trim().startsWith(`${name}=`))
    return match?.split('=')[1]
  }

  const fbclid = params.get('fbclid')
  const fbp = getCookie('_fbp')
  const fbc = getCookie('_fbc') || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined)

  const keys: (keyof UrlParams)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid',
    'sck',
    'src'
  ]

  const result: UrlParams = {}

  for (const key of keys) {
    const value = params.get(key)
    if (value) result[key] = value
  }

  if (fbp) result.fbp = fbp
  if (fbc) result.fbc = fbc

  return result
}
