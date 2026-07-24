const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

function radians(value) {
  return (value * Math.PI) / 180
}

function distanceInMiles(origin, destination) {
  const earthRadiusMiles = 3958.8
  const latitudeDelta = radians(destination.latitude - origin.latitude)
  const longitudeDelta = radians(destination.longitude - origin.longitude)
  const firstLatitude = radians(origin.latitude)
  const secondLatitude = radians(destination.latitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(haversine))
}

function joinAddress(tags) {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ')
  return [
    street,
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:postcode'],
  ]
    .filter(Boolean)
    .join(', ')
}

function getCoordinates(element) {
  const latitude = element.lat ?? element.center?.lat
  const longitude = element.lon ?? element.center?.lon
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null
}

function getCategory(tags) {
  const identity = [tags.name, tags.brand, tags.operator, tags.network]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return /(^|\W)(at&t|att)(\W|$)/.test(identity) ? 'att' : 'shipping'
}

export async function geocodeLocation(query, signal) {
  const parameters = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'us',
  })
  const response = await fetch(`${NOMINATIM_URL}?${parameters}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) throw new Error('Address lookup is temporarily unavailable.')

  const [match] = await response.json()
  if (!match) throw new Error('No U.S. location matched that address or ZIP code.')

  return {
    latitude: Number(match.lat),
    longitude: Number(match.lon),
    label: match.display_name,
  }
}

export async function findNearbyLocations(origin, radiusMiles = 25, signal) {
  const radiusMeters = Math.round(radiusMiles * 1609.344)
  const around = `around:${radiusMeters},${origin.latitude},${origin.longitude}`
  const query = `
    [out:json][timeout:30];
    (
      nwr[brand="AT&T"](${around});
      nwr[brand=ATT](${around});
      nwr[shop=mobile_phone][name="AT&T"](${around});
      nwr[shop=mobile_phone][name="AT&T Store"](${around});
      nwr[amenity=post_office](${around});
      nwr[office=courier](${around});
      nwr[shop~"^(shipping|copyshop)$"](${around});
      nwr[amenity=parcel_locker](${around});
    );
    out center tags;
  `
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: new URLSearchParams({ data: query }),
    signal,
  })

  if (!response.ok) throw new Error('Nearby location data is temporarily unavailable.')

  const data = await response.json()
  const seen = new Set()

  return data.elements
    .map((element) => {
      const coordinates = getCoordinates(element)
      if (!coordinates) return null

      const tags = element.tags ?? {}
      const category = getCategory(tags)
      const name =
        tags.name ??
        tags.brand ??
        tags.operator ??
        (tags.amenity === 'parcel_locker' ? 'Parcel locker' : 'Shipping location')
      const key = `${category}:${name.toLowerCase()}:${coordinates.latitude.toFixed(5)}:${coordinates.longitude.toFixed(5)}`
      if (seen.has(key)) return null
      seen.add(key)

      return {
        id: `${element.type}-${element.id}`,
        category,
        name,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address: joinAddress(tags),
        distanceMiles: distanceInMiles(origin, coordinates),
        provider: tags.brand ?? tags.operator ?? '',
        phone: tags.phone ?? tags['contact:phone'] ?? '',
        website: tags.website ?? tags['contact:website'] ?? '',
        source: 'OpenStreetMap',
      }
    })
    .filter(Boolean)
    .sort((first, second) => first.distanceMiles - second.distanceMiles)
}
