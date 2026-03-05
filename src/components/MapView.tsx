'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MOUNTAINS, MountainData } from '@/data/mountains'

interface Props {
  climbedSet: Set<string>
  selected: MountainData | null
  onSelect: (m: MountainData) => void
}

function createPin(climbed: boolean, selected: boolean) {
  const bg = climbed ? '#22c55e' : '#f97316'
  const border = climbed ? '#15803d' : '#c2410c'
  const size = selected ? 38 : 28
  const shadow = selected
    ? `0 0 0 4px ${climbed ? '#bbf7d066' : '#fed7aa66'}, 0 4px 12px rgba(0,0,0,0.25)`
    : '0 2px 6px rgba(0,0,0,0.2)'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px; height:${size}px;
        background:${bg};
        border:2.5px solid ${border};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display:flex; align-items:center; justify-content:center;
        box-shadow:${shadow};
        transition: all 0.15s ease;
        cursor: pointer;
      ">
        <span style="transform:rotate(45deg); font-size:${selected ? 14 : 11}px; line-height:1; color:white; font-weight:bold;">
          ${climbed ? '✓' : '▲'}
        </span>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

function FlyToSelected({ selected }: { selected: MountainData | null }) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 9), {
        animate: true,
        duration: 0.6,
      })
    }
  }, [selected, map])
  return null
}

export default function MapView({ climbedSet, selected, onSelect }: Props) {
  return (
    <MapContainer
      center={[36.5, 127.8]}
      zoom={7}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
      maxBounds={[[32.0, 123.5], [40.0, 132.5]]}
      minZoom={6}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <FlyToSelected selected={selected} />
      {MOUNTAINS.map(m => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={createPin(climbedSet.has(String(m.id)), selected?.id === m.id)}
          eventHandlers={{ click: () => onSelect(m) }}
          zIndexOffset={selected?.id === m.id ? 1000 : 0}
        />
      ))}
    </MapContainer>
  )
}
