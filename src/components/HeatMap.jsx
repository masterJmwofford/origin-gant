import { useMemo, useState } from 'react'

import worldMap from '../data/maps/world.json'

const VIEWBOX = { width: 860, height: 460 }
const DOMESTIC_COUNTRIES = new Set(['USA', 'PRI'])
const LATIN_AMERICA_COUNTRIES = new Set([
  'ARG',
  'BLZ',
  'BOL',
  'BRA',
  'CHL',
  'COL',
  'CRI',
  'CUB',
  'DOM',
  'ECU',
  'GTM',
  'GUY',
  'HND',
  'MEX',
  'NIC',
  'PAN',
  'PER',
  'PRY',
  'SLV',
  'SUR',
  'URY',
  'VEN',
])

const countryNamesById = worldMap.features.reduce((names, country) => {
  names[country.id] = country.properties.name
  return names
}, {})

const placeLists = {
  firstnet: {
    title: 'Countries and territories called out for this layer',
    groups: [
      {
        label: 'FirstNet map training focus',
        places: ['United States', 'Puerto Rico'],
      },
      {
        label: 'Also named in plan regional talk/text language',
        places: ['Canada', 'Mexico', 'U.S. Virgin Islands', 'Pacific Territories'],
      },
    ],
    note: 'Use the live coverage map for exact FirstNet service by address. U.S. Virgin Islands and Pacific Territories are named in the plan text but are not available as separate country polygons in this local map file.',
  },
  fiveg: {
    title: 'Places shown for 5G verification',
    groups: [
      {
        label: '5G check focus',
        places: ['United States', 'Puerto Rico'],
      },
    ],
    note: '5G access is plan, device, and location dependent. This layer does not claim 5G is available everywhere in the highlighted places.',
  },
  latin: {
    title: 'Latin America plan feature list',
    groups: [
      {
        label: 'Exact plan language available in this app',
        places: ['20 Latin American countries'],
      },
      {
        label: 'Training map category currently highlighted',
        places: Array.from(LATIN_AMERICA_COUNTRIES)
          .map((id) => countryNamesById[id])
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b)),
      },
    ],
    note: 'The current source text says Premium 2.0 and Elite 2.0 include 20 Latin American countries, but it does not name the 20. Treat the highlighted country set as a study category only and verify the exact destination before quoting.',
  },
  global: {
    title: 'Elite global data destination list',
    groups: [
      {
        label: 'Exact plan language available in this app',
        places: ['Over 210 destinations'],
      },
    ],
    note: 'The current source text does not store the full over-210 destination list. Verify the customer destination before quoting Elite international data expectations.',
  },
  idp: {
    title: 'International Day Pass destination list',
    groups: [
      {
        label: 'Required check before quoting',
        places: ['Destination availability', 'International Day Pass pricing', 'Account eligibility', 'Roaming compatibility'],
      },
    ],
    note: 'No exact International Day Pass destination or price list is stored in this app. This tab is intentionally a verification workflow, not a quoted offer list.',
  },
  plans: {
    title: 'Places by plan feature',
    groups: [
      {
        label: 'Value 2.0 and Extra 2.0 regional language',
        places: ['United States', 'Canada', 'Mexico', 'Puerto Rico', 'U.S. Virgin Islands', 'Pacific Territories'],
      },
      {
        label: 'Premium 2.0 additional international language',
        places: ['20 Latin American countries, exact list must be verified'],
      },
      {
        label: 'Elite 2.0 additional international language',
        places: ['20GB international data per month for over 210 destinations, exact list must be verified'],
      },
    ],
    note: 'This panel shows only places or destination counts that appear in the app source text. Use official tools before promising a specific country, territory, price, or speed.',
  },
}

const layers = [
  {
    id: 'firstnet',
    label: 'FirstNet Coverage',
    title: 'Domestic FirstNet coverage',
    summary:
      'Use this layer for the core U.S. FirstNet conversation: priority, preemption, Band 14, and AT&T LTE/5G spectrum where supported.',
    supportCue:
      'Customer phrase: “I can explain the FirstNet coverage features, but for address-level coverage we should verify the live coverage map.”',
  },
  {
    id: 'fiveg',
    label: '5G Check',
    title: '5G requires verification',
    summary:
      'FirstNet plan notes say 5G access requires a compatible device and is not available everywhere.',
    supportCue:
      'Customer phrase: “The plan may include 5G access, but the device and location still need to support it.”',
  },
  {
    id: 'latin',
    label: 'Latin America',
    title: 'Premium and Elite Latin America feature',
    summary:
      'FirstNet Premium 2.0 and Elite 2.0 list unlimited talk, text, and high-speed data in 20 Latin American countries at no extra cost; coverage and speeds vary.',
    supportCue:
      'Customer phrase: “That international benefit depends on the plan and the destination, so I’ll match both before quoting.”',
  },
  {
    id: 'global',
    label: 'Elite Global Data',
    title: 'Elite global travel data',
    summary:
      'FirstNet Elite 2.0 lists 20GB of international data per month for over 210 destinations. After 20GB, international data speeds may be reduced to a maximum of 512 Kbps.',
    supportCue:
      'Customer phrase: “Elite includes a monthly international data feature, but I still want to verify the destination and account details before setting expectations.”',
  },
  {
    id: 'idp',
    label: 'International Day Pass',
    title: 'International Day Pass verification',
    summary:
      'Use this layer as a reminder to verify International Day Pass availability, pricing, destination support, and account eligibility in official tools before quoting or adding it.',
    supportCue:
      'Customer phrase: “I can check whether International Day Pass is the right option for your destination before we add or quote it.”',
  },
  {
    id: 'plans',
    label: 'Plan Differences',
    title: 'Plan-based coverage and travel differences',
    summary:
      'All listed individual FirstNet plans include First Priority language. Premium and Elite add more international features than Value and Extra.',
    supportCue:
      'Customer phrase: “The plan changes what travel benefits are included; the coverage map still needs to be checked for the exact location.”',
  },
]

const planCards = [
  {
    id: 'value',
    name: 'Value 2.0',
    domestic: 'First Priority, unlimited talk/text/data, hotspot included.',
    travel: 'U.S., Canada, Mexico, Puerto Rico, U.S. Virgin Islands, and Pacific Territories talk/text language.',
    verify: '5G requires compatible device and is not available everywhere.',
  },
  {
    id: 'extra',
    name: 'Extra 2.0',
    domestic: 'First Priority plus unlimited hotspot language.',
    travel: 'Same regional talk/text language; security features may differ while roaming internationally.',
    verify: '5G requires compatible device and is not available everywhere.',
  },
  {
    id: 'premium',
    name: 'Premium 2.0',
    domestic: 'First Priority plus unlimited hotspot language.',
    travel: 'Adds 20 Latin American countries at no extra cost; coverage and speeds vary.',
    verify: 'Verify destination and plan before quoting international expectations.',
  },
  {
    id: 'elite',
    name: 'Elite 2.0',
    domestic: 'First Priority plus unlimited hotspot language.',
    travel: 'Adds Latin America feature and 20GB international data per month for over 210 destinations.',
    verify: 'After 20GB, international data speeds may be reduced to a maximum of 512 Kbps.',
  },
]

function projectPoint([longitude, latitude]) {
  const x = ((longitude + 180) / 360) * VIEWBOX.width
  const y = ((90 - latitude) / 180) * VIEWBOX.height

  return [x, y]
}

function ringToPath(ring) {
  return ring
    .map((coordinate, index) => {
      const [x, y] = projectPoint(coordinate)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function polygonToPath(polygon) {
  return polygon.map((ring) => `${ringToPath(ring)} Z`).join(' ')
}

function geometryToPath(geometry) {
  if (geometry.type === 'Polygon') {
    return polygonToPath(geometry.coordinates)
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((polygon) => polygonToPath(polygon)).join(' ')
  }

  return ''
}

function getCountryClass(country, activeLayer) {
  const isDomestic = DOMESTIC_COUNTRIES.has(country.id)
  const isLatinAmerica = LATIN_AMERICA_COUNTRIES.has(country.id)
  const isTravelDestination = !isDomestic && country.id !== 'ATA'

  if ((activeLayer === 'firstnet' || activeLayer === 'plans') && isDomestic) {
    return 'map-country active-domestic'
  }

  if (activeLayer === 'fiveg' && isDomestic) {
    return 'map-country active-fiveg'
  }

  if ((activeLayer === 'latin' || activeLayer === 'plans') && isLatinAmerica) {
    return 'map-country active-latin'
  }

  if ((activeLayer === 'global' || activeLayer === 'plans') && isTravelDestination) {
    return 'map-country active-global'
  }

  if (activeLayer === 'idp' && isTravelDestination) {
    return 'map-country active-idp'
  }

  return 'map-country'
}

export default function HeatMap() {
  const [activeLayer, setActiveLayer] = useState('firstnet')
  const layer = useMemo(
    () => layers.find((item) => item.id === activeLayer) ?? layers[0],
    [activeLayer],
  )
  const activePlaces = placeLists[activeLayer] ?? placeLists.firstnet
  const countryPaths = useMemo(
    () =>
      worldMap.features
        .filter((country) => country.id !== 'ATA')
        .map((country) => ({
          id: country.id,
          name: country.properties.name,
          d: geometryToPath(country.geometry),
        })),
    [],
  )

  return (
    <div className={`heatmap-tool heatmap-${activeLayer}`}>
      <section className="heatmap-brief">
        <div>
          <p className="eyebrow">Coverage Learning Map</p>
          <h2>FirstNet HeatMap</h2>
          <p>
            A guided visual for explaining plan-based coverage, 5G checks, and travel
            features. This is a training aid, not a live address-level coverage checker.
          </p>
        </div>
        <div className="heatmap-warning">
          <strong>Verify before quoting</strong>
          <span>Use official coverage and destination tools for exact customer answers.</span>
        </div>
      </section>

      <div className="heatmap-layer-buttons" aria-label="Coverage layers">
        {layers.map((item) => (
          <button
            className={activeLayer === item.id ? 'active' : ''}
            key={item.id}
            type="button"
            onClick={() => setActiveLayer(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="heatmap-board">
        <div className="world-map-panel">
          <svg
            viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
            role="img"
            aria-label={`World map layer: ${layer.title}`}
          >
            <rect className="map-ocean" x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} rx="18" />
            <g className="country-layer">
              {countryPaths.map((country) => (
                <path
                  aria-label={country.name}
                  className={getCountryClass(country, activeLayer)}
                  d={country.d}
                  key={country.id}
                />
              ))}
            </g>
            <g className="idp-pins" aria-hidden="true">
              <circle className="idp-pin" cx="460" cy="142" r="9" />
              <circle className="idp-pin" cx="614" cy="176" r="9" />
              <circle className="idp-pin" cx="724" cy="348" r="9" />
              <circle className="idp-pin" cx="238" cy="314" r="9" />
            </g>
            <circle className="fiveg-dot dot-one" cx="188" cy="162" r="7" />
            <circle className="fiveg-dot dot-two" cx="224" cy="172" r="7" />
            <circle className="fiveg-dot dot-three" cx="154" cy="176" r="7" />
            <path className="travel-arc arc-one" d="M210 166 C322 92 410 96 468 136" />
            <path className="travel-arc arc-two" d="M210 174 C350 244 562 252 722 348" />
            <path className="travel-arc arc-three" d="M204 180 C278 252 264 324 224 386" />
            <text x="128" y="236">U.S. FirstNet</text>
            <text x="176" y="430">Latin America</text>
            <text x="586" y="266">International verify</text>
          </svg>
          <p className="map-disclaimer">
            Country shapes come from local GeoJSON topology; colored countries are training cues, not live coverage boundaries or exact destination lists.
          </p>
        </div>

        <aside className="heatmap-layer-card">
          <p className="eyebrow">Active Layer</p>
          <h3>{layer.title}</h3>
          <p>{layer.summary}</p>
          <strong>{layer.supportCue}</strong>
        </aside>
      </section>

      <section className="coverage-place-list" aria-label="Countries and territories by active layer">
        <div>
          <p className="eyebrow">Places List</p>
          <h3>{activePlaces.title}</h3>
        </div>
        <div className="coverage-place-groups">
          {activePlaces.groups.map((group) => (
            <article key={group.label}>
              <strong>{group.label}</strong>
              <div className="place-chip-list">
                {group.places.map((place) => (
                  <span key={place}>{place}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p>{activePlaces.note}</p>
      </section>

      <section className="coverage-plan-grid" aria-label="Plan-based coverage comparison">
        {planCards.map((plan) => (
          <article key={plan.id}>
            <span>{plan.name}</span>
            <h3>{plan.domestic}</h3>
            <p>{plan.travel}</p>
            <small>{plan.verify}</small>
          </article>
        ))}
      </section>
    </div>
  )
}
