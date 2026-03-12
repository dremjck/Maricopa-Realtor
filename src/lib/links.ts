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
