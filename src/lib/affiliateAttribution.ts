export interface AffiliateAttribution {
  affiliate_slug?: string
  ref_code?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  landing_page?: string
  referrer_url?: string
}

const ATTRIBUTION_KEY = 'shibuya_affiliate_attribution'
const TRACKED_CODES_KEY = 'shibuya_affiliate_tracked_codes'

function trimOrUndefined(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function readAffiliateAttribution(): AffiliateAttribution | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY)
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as AffiliateAttribution
  } catch {
    return null
  }
}

function readTrackedCodes(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(TRACKED_CODES_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

function writeTrackedCodes(codes: string[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(TRACKED_CODES_KEY, JSON.stringify(Array.from(new Set(codes))))
}

export function rememberAffiliateAttribution(attribution: AffiliateAttribution): AffiliateAttribution | null {
  if (typeof window === 'undefined') {
    return null
  }

  const normalized: AffiliateAttribution = {
    affiliate_slug: trimOrUndefined(attribution.affiliate_slug),
    ref_code: trimOrUndefined(attribution.ref_code),
    utm_source: trimOrUndefined(attribution.utm_source),
    utm_medium: trimOrUndefined(attribution.utm_medium),
    utm_campaign: trimOrUndefined(attribution.utm_campaign),
    landing_page: trimOrUndefined(attribution.landing_page),
    referrer_url: trimOrUndefined(attribution.referrer_url),
  }

  const hasMeaningfulValue = Object.values(normalized).some(Boolean)
  if (!hasMeaningfulValue) {
    return null
  }

  window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(normalized))
  return normalized
}

export function captureAffiliateAttributionFromLocation(pathname: string, search: string): AffiliateAttribution | null {
  if (typeof window === 'undefined') {
    return null
  }

  const params = new URLSearchParams(search)
  const affiliateSlug = trimOrUndefined(params.get('affiliate_slug') || params.get('affiliate'))
  return rememberAffiliateAttribution({
    affiliate_slug: affiliateSlug,
    ref_code: trimOrUndefined(params.get('ref_code') || params.get('ref')),
    utm_source: trimOrUndefined(params.get('utm_source')),
    utm_medium: trimOrUndefined(params.get('utm_medium')) || (affiliateSlug ? 'affiliate' : undefined),
    utm_campaign: trimOrUndefined(params.get('utm_campaign')),
    landing_page: pathname,
    referrer_url: document.referrer || undefined,
  })
}

export function getPreferredAffiliateCode(attribution: AffiliateAttribution | null): string | null {
  const code = attribution?.ref_code?.trim() || attribution?.affiliate_slug?.trim()
  return code || null
}

export function wasAffiliateClickTracked(code: string): boolean {
  const normalized = code.trim().toUpperCase()
  return readTrackedCodes().includes(normalized)
}

export function markAffiliateClickTracked(code: string): void {
  const normalized = code.trim().toUpperCase()
  if (!normalized) {
    return
  }
  writeTrackedCodes([...readTrackedCodes(), normalized])
}
