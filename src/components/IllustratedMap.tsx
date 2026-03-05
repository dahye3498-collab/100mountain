'use client'

import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { MountainData } from '@/data/mountains'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Difficulty → color scheme (matches reference image style)
function getPinColor(difficulty: string, climbed: boolean) {
  if (climbed) return { fill: '#22c55e', stroke: '#15803d', snow: '#d1fae5' }
  if (difficulty === '상') return { fill: '#ef4444', stroke: '#b91c1c', snow: '#ffffff' }
  if (difficulty === '중') return { fill: '#f97316', stroke: '#c2410c', snow: '#ffffff' }
  return { fill: '#eab308', stroke: '#a16207', snow: '#ffffff' }
}

interface PinProps {
  mountain: MountainData
  climbed: boolean
  selected: boolean
}

function MountainPin({ mountain, climbed, selected }: PinProps) {
  const { fill, stroke, snow } = getPinColor(mountain.difficulty, climbed)
  const s = selected ? 6.5 : 4.5

  return (
    <g style={{ cursor: 'pointer' }}>
      {/* Glow ring when selected */}
      {selected && (
        <circle r={s * 2.8} fill={fill} opacity="0.18" />
      )}

      {/* Mountain body (triangle) */}
      <polygon
        points={`0,${-s * 2.4} ${-s * 1.1},${s * 0.5} ${s * 1.1},${s * 0.5}`}
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {/* Snow cap */}
      <polygon
        points={`0,${-s * 2.4} ${-s * 0.45},${-s * 1.25} ${s * 0.45},${-s * 1.25}`}
        fill={snow}
        opacity="0.85"
      />

      {/* Checkmark for climbed */}
      {climbed && (
        <text
          textAnchor="middle"
          y={-s * 0.6}
          fontSize={s * 0.95}
          fill="white"
          fontWeight="900"
          dominantBaseline="middle"
        >✓</text>
      )}

      {/* Mountain name */}
      <text
        textAnchor="middle"
        y={s * 0.5 + 5}
        fontSize={selected ? 5.5 : 4}
        fill="#374151"
        fontWeight={selected ? '800' : '600'}
        stroke="white"
        strokeWidth="2.5"
        paintOrder="stroke"
        style={{ fontFamily: 'sans-serif' }}
      >
        {mountain.name}
      </text>

      {/* Height (when selected) */}
      {selected && (
        <text
          textAnchor="middle"
          y={s * 0.5 + 12}
          fontSize="4"
          fill="#6b7280"
          stroke="white"
          strokeWidth="2"
          paintOrder="stroke"
          style={{ fontFamily: 'sans-serif' }}
        >
          {mountain.height.toLocaleString()}m
        </text>
      )}
    </g>
  )
}

interface Props {
  mountains: MountainData[]
  climbedSet: Set<string>
  selected: MountainData | null
  onSelect: (m: MountainData) => void
}

export default function IllustratedMap({ mountains, climbedSet, selected, onSelect }: Props) {
  return (
    // Sea background
    <div className="w-full h-full" style={{ background: 'linear-gradient(160deg, #bfdbfe 0%, #93c5fd 100%)' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [127.8, 36.0],
          scale: 4600,
        }}
        width={420}
        height={560}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Wave decoration (sea text) */}
        <text x="22" y="280" fill="#93c5fd" fontSize="9" fontWeight="bold" opacity="0.6"
          transform="rotate(-90 22 280)" style={{ fontFamily: 'sans-serif' }}>서해</text>
        <text x="398" y="240" fill="#93c5fd" fontSize="9" fontWeight="bold" opacity="0.6"
          transform="rotate(90 398 240)" style={{ fontFamily: 'sans-serif' }}>동해</text>

        {/* Land */}
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies
              .filter((geo: any) => ['410', '408'].includes(String(geo.id)))
              .map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={String(geo.id) === '410' ? '#bbf7d0' : '#d9f0d0'}
                  stroke="#86efac"
                  strokeWidth="0.8"
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
          }
        </Geographies>

        {/* Mountain markers — sort so selected renders on top */}
        {[...mountains]
          .sort((a, b) => (selected?.id === a.id ? 1 : selected?.id === b.id ? -1 : 0))
          .map(m => (
            <Marker
              key={m.id}
              coordinates={[m.lng, m.lat]}
              onClick={() => onSelect(m)}
            >
              <MountainPin
                mountain={m}
                climbed={climbedSet.has(String(m.id))}
                selected={selected?.id === m.id}
              />
            </Marker>
          ))}
      </ComposableMap>
    </div>
  )
}
