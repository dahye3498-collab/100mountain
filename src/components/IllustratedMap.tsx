'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MountainData } from '@/data/mountains'

function getMountainColor(difficulty: string, climbed: boolean) {
  if (climbed) return '#22c55e'
  if (difficulty === '\uc0c1') return '#ef4444'
  if (difficulty === '\uc911') return '#f97316'
  return '#eab308'
}

function createMountainIcon(difficulty: string, climbed: boolean, isSelected: boolean) {
  const color = getMountainColor(difficulty, climbed)
  const size = isSelected ? 32 : 22
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg">
      <polygon points="11,1 1,19 21,19" fill="${color}" stroke="${color === '#22c55e' ? '#15803d' : '#333'}" stroke-width="1" stroke-linejoin="round"/>
      <polygon points="11,1 7.5,8 14.5,8" fill="white" opacity="0.5" stroke-linejoin="round"/>
      ${climbed ? '<text x="11" y="15" text-anchor="middle" fill="white" font-size="8" font-weight="bold" dominant-baseline="middle">&#10003;</text>' : ''}
    </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })
}

function FlyToSelected({ selected }: { selected: MountainData | null }) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 10, { duration: 0.5 })
    }
  }, [selected, map])
  return null
}

interface Props {
  mountains: MountainData[]
  climbedSet: Set<string>
  selected: MountainData | null
  onSelect: (m: MountainData) => void
}

export default function IllustratedMap({ mountains, climbedSet, selected, onSelect }: Props) {
  return (
    <MapContainer
      center={[36.0, 127.8]}
      zoom={7}
      minZoom={6}
      maxZoom={15}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
      />
      <FlyToSelected selected={selected} />
      {mountains.map(m => {
        const climbed = climbedSet.has(String(m.id))
        const isSelected = selected?.id === m.id
        return (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={createMountainIcon(m.difficulty, climbed, isSelected)}
            eventHandlers={{ click: () => onSelect(m) }}
          >
            <Tooltip
              direction="bottom"
              offset={[0, 2]}
              permanent={isSelected}
              className="mountain-tooltip"
            >
              <span style={{ fontWeight: 700, fontSize: isSelected ? 13 : 11 }}>
                {m.name}
              </span>
              {isSelected && (
                <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 4 }}>
                  {m.height.toLocaleString()}m
                </span>
              )}
            </Tooltip>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
