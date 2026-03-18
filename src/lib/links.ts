export function getZillowSearchUrl(address: string | null): string | null {
  if (!address?.trim()) return null
  const encoded = encodeURIComponent(address.trim())
  return `https://www.zillow.com/homes/${encoded}_rb/`
}

export function getRedfinSearchUrl(address: string | null): string | null {
  if (!address?.trim()) return null
  const encoded = encodeURIComponent(address.trim())
  return `https://www.redfin.com/search?search=address&query=${encoded}`
}

export function getGoogleMapsUrl(address: string | null): string | null {
  if (!address?.trim()) return null
  const encoded = encodeURIComponent(address.trim())
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`
}

export function getMaricopaAssessorUrl(apn: string | null): string | null {
  if (!apn?.trim()) return null
  const encoded = encodeURIComponent(apn.trim())
  return `https://mcassessor.maricopa.gov/mcs/?q=${encoded}`
}

export type ParsedAddress = {
  street: string
  city: string
  state: string
  zip: string
}

const STREET_SUFFIXES = [
  'RD', 'DR', 'ST', 'AVE', 'BLVD', 'LN', 'CT', 'PL', 'WAY', 'CIR',
  'PKWY', 'HWY', 'TRL', 'LOOP', 'PASS', 'TER', 'CV', 'PT', 'RUN',
  'XING', 'SQ', 'PATH', 'WALK', 'ALY', 'ROW', 'GLN', 'VW', 'CRST',
  'HL', 'HLS', 'MDW', 'MDWS', 'PARK', 'RIDGE', 'CREEK', 'CANYON'
]

export function parseAddressFromAssessorSummary(
  assessorSummary: string | null
): ParsedAddress | null {
  if (!assessorSummary) return null

  // Find "located at " and extract until first " ." or end of sentence
  const locatedAtMatch = assessorSummary.match(/located at\s+(.+?)\s*\./i)
  if (!locatedAtMatch) return null

  const addressChunk = locatedAtMatch[1].trim()

  // Parse state and zip from the end: ", STATE ZIP" or " STATE ZIP"
  // Pattern: ends with 2-letter state and 5-digit zip
  const stateZipMatch = addressChunk.match(/,?\s*([A-Z]{2})\s+(\d{5})\s*$/)
  if (!stateZipMatch) return null

  const state = stateZipMatch[1]
  const zip = stateZipMatch[2]

  // Find the comma before state/zip to split street+city from state+zip
  const commaIndex = addressChunk.lastIndexOf(',')
  if (commaIndex === -1) return null

  const streetAndCity = addressChunk.substring(0, commaIndex).trim()
  if (!streetAndCity) return null

  // Find the last street suffix to split street from city
  let lastSuffixIndex = -1
  let lastSuffixLength = 0

  for (const suffix of STREET_SUFFIXES) {
    // Match whole word only (with word boundaries)
    const regex = new RegExp(`\\b${suffix}\\b`, 'gi')
    let match
    while ((match = regex.exec(streetAndCity)) !== null) {
      if (match.index > lastSuffixIndex) {
        lastSuffixIndex = match.index
        lastSuffixLength = suffix.length
      }
    }
  }

  if (lastSuffixIndex === -1) {
    // No street suffix found - can't reliably split street from city
    return null
  }

  const street = streetAndCity.substring(0, lastSuffixIndex + lastSuffixLength).trim()
  const city = streetAndCity.substring(lastSuffixIndex + lastSuffixLength).trim()

  if (!street || !city) return null

  return { street, city, state, zip }
}

export function buildTruePeopleSearchUrlFromParsed(parsed: ParsedAddress): string {
  const encodedStreet = encodeURIComponent(parsed.street)
  const cityStateZip = `${parsed.city}, ${parsed.state} ${parsed.zip}`
  const encodedCityStateZip = encodeURIComponent(cityStateZip)
  return `https://www.truepeoplesearch.com/resultaddress?streetaddress=${encodedStreet}&citystatezip=${encodedCityStateZip}`
}

export function buildTruePeopleSearchUrl(
  address: string | null,
  city: string | null,
  state: string | null,
  zip: string | null
): string | null {
  const trimmedAddress = address?.trim()
  const trimmedCity = city?.trim()
  const trimmedState = state?.trim()
  const trimmedZip = zip?.trim()

  if (!trimmedAddress || !trimmedCity || !trimmedState || !trimmedZip) {
    return null
  }

  const encodedAddress = encodeURIComponent(trimmedAddress)
  const cityStateZip = `${trimmedCity}, ${trimmedState} ${trimmedZip}`
  const encodedCityStateZip = encodeURIComponent(cityStateZip)

  return `https://www.truepeoplesearch.com/resultaddress?streetaddress=${encodedAddress}&citystatezip=${encodedCityStateZip}`
}

export type TruePeopleSearchResult = {
  url: string | null
  source: 'assessor_summary' | 'structured_fields' | 'none'
  parsed: ParsedAddress | null
  reason: string | null
}

export function getTruePeopleSearchUrl(
  assessorSummary: string | null,
  address: string | null,
  city: string | null,
  state: string | null,
  zip: string | null,
  leadId: string,
  enableDebug: boolean = true
): TruePeopleSearchResult {
  const debug = (msg: string, data?: unknown) => {
    if (enableDebug) {
      if (data !== undefined) {
        console.log(`[TruePeopleSearch][${leadId}] ${msg}`, data)
      } else {
        console.log(`[TruePeopleSearch][${leadId}] ${msg}`)
      }
    }
  }

  debug('Starting URL generation')
  debug('Raw assessor_summary:', assessorSummary)
  debug('Structured fields:', { address, city, state, zip })

  // PRIMARY: Try parsing from assessor_summary
  const parsedFromAssessor = parseAddressFromAssessorSummary(assessorSummary)
  
  if (parsedFromAssessor) {
    debug('Successfully parsed from assessor_summary:', parsedFromAssessor)
    const url = buildTruePeopleSearchUrlFromParsed(parsedFromAssessor)
    debug('Generated URL from assessor:', url)
    return {
      url,
      source: 'assessor_summary',
      parsed: parsedFromAssessor,
      reason: null
    }
  }

  debug('Failed to parse from assessor_summary, attempting fallback to structured fields')

  // FALLBACK: Try structured fields
  const structuredUrl = buildTruePeopleSearchUrl(address, city, state, zip)
  
  if (structuredUrl) {
    const parsed: ParsedAddress = {
      street: address!.trim(),
      city: city!.trim(),
      state: state!.trim(),
      zip: zip!.trim()
    }
    debug('Using structured fields fallback:', parsed)
    debug('Generated URL from structured fields:', structuredUrl)
    return {
      url: structuredUrl,
      source: 'structured_fields',
      parsed,
      reason: null
    }
  }

  // FAILURE: Neither method worked
  const reason = !assessorSummary
    ? 'No assessor_summary available'
    : !address || !city || !state || !zip
      ? `Missing structured fields: ${[
          !address && 'address',
          !city && 'city', 
          !state && 'state',
          !zip && 'zip'
        ].filter(Boolean).join(', ')}`
      : 'Could not parse address from assessor_summary and structured fields incomplete'

  debug('LINK NOT RENDERED - Reason:', reason)

  return {
    url: null,
    source: 'none',
    parsed: null,
    reason
  }
}
