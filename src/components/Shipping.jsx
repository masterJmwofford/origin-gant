import { useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { findNearbyLocations, geocodeLocation } from '../utils/locationSearch'

const defaultMapCenter = { latitude: 39.8283, longitude: -98.5795 }

function RecenterMap({ center, zoom }) {
  const map = useMap()
  map.setView([center.latitude, center.longitude], zoom)
  return null
}

const policySections = [
  {
    title: 'Shipping Equipment',
    badge: 'Outbound',
    summary:
      'Use the official order or account support path to verify the shipping address, order status, tracking number, delivery method, and whether the order is for a new line, upgrade, replacement, accessory, SIM, or agency-managed equipment.',
    checkpoints: [
      'Confirm the account path first: Subscriber Paid, Agency Paid, FirstNet and Family, or CRU-style business responsibility.',
      'Verify the item type before setting expectations: phone, tablet, hotspot, router, wearable, SIM/eSIM support, accessory, replacement, or warranty/protection device.',
      'Use official tracking for exact delivery dates. This training tool can estimate ranges only; it cannot see live carrier scans.',
      'For agency-paid equipment, verify who is authorized to receive equipment and whether shipment goes to an agency address, site location, depot, or end user.',
    ],
  },
  {
    title: 'Returning Equipment',
    badge: 'Return',
    summary:
      'AT&T wireless return policy language should be treated as the controlling return source unless a FirstNet or agency-specific order path gives different instructions. The official policy references a return period, condition requirements, proof of purchase, and possible fees.',
    checkpoints: [
      'Standard AT&T wireless return policy language references returns or exchanges within 14 days from purchase date, or shipping date when equipment is shipped.',
      'Returned equipment must be in like-new physical and working condition with original components, original packaging, and receipt or proof of purchase.',
      'Return by mail should be initiated through official care or account channels, and agents should verify whether a prepaid shipping label is available for that order.',
      'Restocking fees can apply. AT&T policy language references up to a $55 device restocking fee and an accessory restocking fee for accessories $100 and over, except where prohibited.',
    ],
  },
  {
    title: 'Lost or Stolen Equipment',
    badge: 'Protect',
    summary:
      'The customer goal is account protection first: verify the caller, confirm the affected line/device, and use official support steps to suspend service, block a device when appropriate, and route replacement or protection claims.',
    checkpoints: [
      'Ask whether the device is lost, stolen, damaged, delayed in shipment, or only missing from an order package. Each path is different.',
      'AT&T support language says customers can suspend wireless service or block a device when a device is lost or stolen.',
      'Before suspension, remind the caller that finding tools may stop working after service is suspended, based on AT&T support guidance.',
      'Replacement depends on warranty, protection coverage, agency process, upgrade eligibility, inventory, and official account permissions.',
    ],
  },
  {
    title: 'Retrieving Lost Equipment',
    badge: 'Recover',
    summary:
      'Retrieval should focus on verified ownership, device status, and a documented path back to service or return shipping. Do not promise that a device can be recovered, reactivated, or accepted without account review.',
    checkpoints: [
      'If the customer found the device, verify the account, line, IMEI when available, and whether the device was suspended, blocked, replaced, or claimed through protection.',
      'If the device was already replaced, clarify whether the recovered equipment must be returned under the claim, warranty, or agency process.',
      'If the customer received the wrong equipment or missing-box shipment, document the order number, package condition, tracking details, and what was received.',
      'If equipment must be shipped back, instruct the learner to use only the official label and instructions tied to that order or claim.',
    ],
  },
]

const accountPaths = [
  {
    label: 'Subscriber Paid',
    details:
      'The individual eligible user usually manages their own order, return, billing, and replacement conversation after verification. Use FirstNet Central and official care paths for account-specific action.',
  },
  {
    label: 'Agency Paid',
    details:
      'The organization may control shipping addresses, approvals, inventory, replacement handling, and who can request changes. Verify admin authority before changing equipment flow.',
  },
  {
    label: 'FirstNet and Family',
    details:
      'Separate the FirstNet subscriber line from AT&T family lines. Equipment, return, and billing ownership can differ by line, purchase path, and account role.',
  },
  {
    label: 'CRU / Business Responsibility',
    details:
      'Corporate Responsibility Users can have term or business-account rules that affect returns, exchanges, service commitment, and cancellation responsibilities.',
  },
]

const sourceLinks = [
  {
    label: 'FirstNet Help',
    url: 'https://www.firstnet.com/help.html',
  },
  {
    label: 'FirstNet Account Help',
    url: 'https://www.firstnet.com/help/account-help.html',
  },
  {
    label: 'AT&T Wireless Return Policy',
    url: 'https://www.att.com/wireless/return-policy/',
  },
  {
    label: 'AT&T Lost/Stolen Device Support',
    url: 'https://www.att.com/support/article/wireless/KM1046747/',
  },
  {
    label: 'AT&T Delivery and Shipping Options',
    url: 'https://www.att.com/wireless/delivery-and-shipping-options/',
  },
]

const remoteKeywords = [
  'alaska',
  'ak',
  'hawaii',
  'hi',
  'puerto rico',
  'pr',
  'guam',
  'virgin islands',
  'vi',
  'american samoa',
  'northern mariana',
  'mp',
  'territory',
]

const metroKeywords = [
  'new york',
  'los angeles',
  'chicago',
  'houston',
  'phoenix',
  'philadelphia',
  'san antonio',
  'san diego',
  'dallas',
  'austin',
  'atlanta',
  'miami',
  'seattle',
  'denver',
  'boston',
  'washington',
  'charlotte',
]

function normalizeAddress(value) {
  return value.trim().toLowerCase().replace(/[.,]/g, ' ')
}

function addBusinessDays(startDate, days) {
  const result = new Date(startDate)
  let remaining = days

  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) remaining -= 1
  }

  return result.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function estimateShipping(address) {
  const normalized = normalizeAddress(address)

  if (!normalized) {
    return {
      label: 'Address needed',
      confidence: 'No estimate yet',
      outbound: 'Enter a destination ZIP, city, state, or address.',
      returns: 'Enter the customer return origin to estimate the return transit range.',
      notes: [
        'Use official tracking or account tools for exact shipment timing.',
        'This estimator does not access carrier APIs, customer orders, or inventory systems.',
      ],
    }
  }

  const isRemote = remoteKeywords.some((keyword) => normalized.includes(keyword))
  const isMetro = metroKeywords.some((keyword) => normalized.includes(keyword))
  const range = isRemote
    ? { min: 5, max: 10, type: 'Remote, Alaska, Hawaii, or territory planning range' }
    : isMetro
      ? { min: 2, max: 4, type: 'Large metro planning range' }
      : { min: 3, max: 6, type: 'Standard U.S. planning range' }

  return {
    label: range.type,
    confidence: 'Training estimate only',
    outbound: `${range.min}-${range.max} business days after fulfillment and carrier pickup`,
    returns: `${range.min + 1}-${range.max + 2} business days after the return package is scanned`,
    earliest: addBusinessDays(new Date(), range.min),
    latest: addBusinessDays(new Date(), range.max),
    notes: [
      'Delivery may change because of inventory, order review, weather, remote routing, holidays, carrier delays, or agency shipping rules.',
      'Return timing starts when the return package is accepted or scanned, not when the label is created.',
      'For live customer promises, quote the official tracking page or account tool instead of this estimate.',
    ],
  }
}

function Shipping() {
  const [address, setAddress] = useState('')
  const [locationStatus, setLocationStatus] = useState('Location has not been requested.')
  const [coords, setCoords] = useState(null)
  const [locations, setLocations] = useState([])
  const [radiusMiles, setRadiusMiles] = useState(25)
  const [locationFilter, setLocationFilter] = useState('all')
  const [isSearching, setIsSearching] = useState(false)
  const searchController = useRef(null)
  const estimate = useMemo(() => estimateShipping(address), [address])
  const visibleLocations = useMemo(
    () =>
      locationFilter === 'all'
        ? locations
        : locations.filter((location) => location.category === locationFilter),
    [locationFilter, locations],
  )

  async function loadNearbyLocations(origin, label = 'your location') {
    searchController.current?.abort()
    const controller = new AbortController()
    searchController.current = controller
    setIsSearching(true)
    setLocationStatus(`Finding AT&T and shipping locations near ${label}...`)

    try {
      const results = await findNearbyLocations(origin, radiusMiles, controller.signal)
      setCoords(origin)
      setLocations(results)
      const attCount = results.filter((location) => location.category === 'att').length
      const shippingCount = results.length - attCount
      setLocationStatus(
        `Found ${attCount} AT&T and ${shippingCount} shipping locations within ${radiusMiles} miles.`,
      )
    } catch (error) {
      if (error.name !== 'AbortError') setLocationStatus(error.message)
    } finally {
      if (searchController.current === controller) setIsSearching(false)
    }
  }

  function findLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported in this browser.')
      return
    }

    setLocationStatus('Requesting location permission...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        loadNearbyLocations(nextCoords)
      },
      (error) => {
        setLocationStatus(`Location unavailable: ${error.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  async function searchAddress(event) {
    event.preventDefault()
    if (!address.trim()) {
      setLocationStatus('Enter a U.S. address, city/state, or ZIP code to search.')
      return
    }

    searchController.current?.abort()
    const controller = new AbortController()
    searchController.current = controller
    setIsSearching(true)
    setLocationStatus('Locating the entered address...')

    try {
      const result = await geocodeLocation(address.trim(), controller.signal)
      await loadNearbyLocations(result, result.label)
    } catch (error) {
      if (error.name !== 'AbortError') {
        setLocationStatus(error.message)
        setIsSearching(false)
      }
    }
  }

  return (
    <div className="shipping-tool">
      <section className="shipping-hero">
        <div>
          <p className="eyebrow">Equipment Logistics</p>
          <h2>Shipping, Returns, and Lost Equipment Desk</h2>
          <p>
            A support-facing guide for setting accurate expectations around equipment shipments,
            returns, replacements, and lost-device recovery. It separates documented policy points
            from local estimates so agents do not overpromise.
          </p>
        </div>
        <div className="shipping-hero-card" aria-label="Shipping desk summary">
          <span>Verify</span>
          <strong>Account path, order, device, label, and tracking</strong>
          <p>Exact shipping dates must come from official order, tracking, or account tools.</p>
        </div>
      </section>

      <section className="shipping-policy-grid" aria-label="Equipment policy sections">
        {policySections.map((section) => (
          <article className="shipping-policy-card" key={section.title}>
            <span>{section.badge}</span>
            <h3>{section.title}</h3>
            <p>{section.summary}</p>
            <ul>
              {section.checkpoints.map((checkpoint) => (
                <li key={checkpoint}>{checkpoint}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="shipping-account-paths">
        <div className="section-heading">
          <p className="eyebrow">Account Path Differences</p>
          <h3>Who controls the shipping decision?</h3>
        </div>
        <div className="shipping-path-list">
          {accountPaths.map((path) => (
            <article key={path.label}>
              <strong>{path.label}</strong>
              <p>{path.details}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shipping-estimator">
        <div className="section-heading">
          <p className="eyebrow">Estimate</p>
          <h3>Address-Based Planning Range</h3>
          <p>
            This estimates a training range from the entered location. It does not access live
            carrier tracking, order inventory, customer accounts, or return-label systems.
          </p>
        </div>

        <form className="shipping-address-form" onSubmit={searchAddress}>
          <label htmlFor="shipping-address">Customer shipping or return location</label>
          <div>
            <input
              id="shipping-address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter ZIP, city/state, or full address"
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching…' : 'Search Map'}
            </button>
            <button className="secondary" type="button" onClick={findLocation} disabled={isSearching}>
              Find My Location
            </button>
          </div>
        </form>

        <div className="shipping-estimate-grid">
          <article>
            <span>{estimate.confidence}</span>
            <h4>{estimate.label}</h4>
            <p>{estimate.outbound}</p>
            {estimate.earliest && (
              <strong>
                Planning window: {estimate.earliest} to {estimate.latest}
              </strong>
            )}
          </article>
          <article>
            <span>Return timing</span>
            <h4>Return shipment range</h4>
            <p>{estimate.returns}</p>
            <strong>Return clock starts after carrier scan.</strong>
          </article>
          <article>
            <span>Verify before quoting</span>
            <h4>Customer-facing guardrails</h4>
            <ul>
              {estimate.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="location-result">
          <strong>Find My Location result</strong>
          <p>{locationStatus}</p>
          {coords && (
            <p>
              Coordinates: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
            </p>
          )}
        </aside>

        <div className="shipping-map-toolbar" aria-label="Location map controls">
          <label>
            Search radius
            <select value={radiusMiles} onChange={(event) => setRadiusMiles(Number(event.target.value))}>
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
            </select>
          </label>
          <div className="shipping-map-filters" role="group" aria-label="Location type">
            {[
              ['all', 'All'],
              ['att', 'AT&T'],
              ['shipping', 'Shipping'],
            ].map(([value, label]) => (
              <button
                className={locationFilter === value ? 'active' : ''}
                type="button"
                key={value}
                onClick={() => setLocationFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="shipping-map-layout">
          <div className="shipping-map" aria-label="Nearby AT&T and shipping locations map">
            <MapContainer
              center={[defaultMapCenter.latitude, defaultMapCenter.longitude]}
              zoom={4}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {coords && <RecenterMap center={coords} zoom={radiusMiles === 50 ? 9 : 11} />}
              {coords && (
                <CircleMarker
                  center={[coords.latitude, coords.longitude]}
                  radius={8}
                  pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }}
                >
                  <Popup>Search center</Popup>
                </CircleMarker>
              )}
              {visibleLocations.map((location) => (
                <CircleMarker
                  key={location.id}
                  center={[location.latitude, location.longitude]}
                  radius={7}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: location.category === 'att' ? '#00a8e0' : '#f97316',
                    fillOpacity: 0.95,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <strong>{location.name}</strong>
                    <br />
                    {location.category === 'att' ? 'AT&T location' : 'Shipping location'}
                    <br />
                    {location.address || 'Address not supplied by OpenStreetMap'}
                    <br />
                    {location.distanceMiles.toFixed(1)} miles away
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="shipping-location-list" aria-live="polite">
            <strong>{visibleLocations.length} mapped locations</strong>
            {visibleLocations.length === 0 ? (
              <p>Search an address or use your location to load nearby markers.</p>
            ) : (
              <ol>
                {visibleLocations.map((location) => (
                  <li key={location.id}>
                    <span className={`location-dot ${location.category}`} aria-hidden="true" />
                    <div>
                      <strong>{location.name}</strong>
                      <span>
                        {location.distanceMiles.toFixed(1)} mi ·{' '}
                        {location.category === 'att' ? 'AT&T' : 'Shipping'}
                      </span>
                      <p>{location.address || 'Address unavailable'}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <p className="shipping-map-note">
          Locations are community-maintained OpenStreetMap data and may be incomplete or outdated.
          Verify AT&T stores with the{' '}
          <a href="https://www.att.com/stores/" target="_blank" rel="noreferrer">
            official AT&T store locator
          </a>{' '}
          and confirm shipping services before sending a customer.
        </p>
      </section>

      <section className="shipping-source-panel">
        <div className="section-heading">
          <p className="eyebrow">Sources</p>
          <h3>Official policy links used for verification</h3>
        </div>
        <ul className="shipping-source-list">
          {sourceLinks.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default Shipping
