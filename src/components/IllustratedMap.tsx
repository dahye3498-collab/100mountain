'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { MountainData } from '@/data/mountains'

// Korea bounding box (approximate for the illustrated map image)
const MAP_BOUNDS = {
  latMin: 33.0,   // Jeju south
  latMax: 38.8,   // north
  lngMin: 125.0,  // west coast
  lngMax: 130.5,  // east coast
}

// Image-specific offsets (tune these to align markers with the map image)
const IMAGE_OFFSET = {
  xPct: 13,   // left padding % where Korea starts in the image
  yPct: 5,    // top padding % where Korea starts in the image
  wPct: 70,   // width % that Korea occupies in the image
  hPct: 85,   // height % that Korea occupies in the image
}

function latLngToPercent(lat: number, lng: number): { x: number; y: number } {
  const xRatio = (lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)
  const yRatio = 1 - (lat - MAP_BOUNDS.latMin) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)
  return {
    x: IMAGE_OFFSET.xPct + xRatio * IMAGE_OFFSET.wPct,
    y: IMAGE_OFFSET.yPct + yRatio * IMAGE_OFFSET.hPct,
  }
}

function getPinColor(difficulty: string, climbed: boolean) {
  if (climbed) return { bg: '#22c55e', border: '#15803d', text: 'white' }
  if (difficulty === '\uc0c1') return { bg: '#ef4444', border: '#b91c1c', text: 'white' }
  if (difficulty === '\uc911') return { bg: '#f97316', border: '#c2410c', text: 'white' }
  return { bg: '#eab308', border: '#a16207', text: 'white' }
}

interface Props {
  mountains: MountainData[]
  climbedSet: Set<string>
  selected: MountainData | null
  onSelect: (m: MountainData) => void
}

export default function IllustratedMap({ mountains, climbedSet, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const lastTouchDist = useRef<number | null>(null)

  const clamp = useCallback((val: number, min: number, max: number) => Math.min(Math.max(val, min), max), [])

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const newScale = clamp(scale + (e.deltaY > 0 ? -0.15 : 0.15), 0.8, 4)
    setScale(newScale)
  }, [scale, clamp])

  // Mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y }
  }, [translate])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setTranslate({
      x: dragStart.current.tx + (e.clientX - dragStart.current.x),
      y: dragStart.current.ty + (e.clientY - dragStart.current.y),
    })
  }, [isDragging])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  // Touch pan & pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: translate.x, ty: translate.y }
    }
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.hypot(dx, dy)
    }
  }, [translate])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setTranslate({
        x: dragStart.current.tx + (e.touches[0].clientX - dragStart.current.x),
        y: dragStart.current.ty + (e.touches[0].clientY - dragStart.current.y),
      })
    }
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const delta = dist - lastTouchDist.current
      setScale(prev => clamp(prev + delta * 0.005, 0.8, 4))
      lastTouchDist.current = dist
    }
  }, [isDragging, clamp])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    lastTouchDist.current = null
  }, [])

  // Prevent default touch behavior for smooth pan
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const prevent = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault() }
    el.addEventListener('touchmove', prevent, { passive: false })
    return () => el.removeEventListener('touchmove', prevent)
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ background: '#FFF8E7', touchAction: 'none' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full h-full relative"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {/* Map background image */}
        <img
          src="/images/Gemini_Generated_Image_jwdisbjwdisbjwdi.png"
          alt="Korea Map"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />

        {/* Mountain markers overlay */}
        <div className="absolute inset-0">
          {mountains.map(m => {
            const { x, y } = latLngToPercent(m.lat, m.lng)
            const climbed = climbedSet.has(String(m.id))
            const isSelected = selected?.id === m.id
            const colors = getPinColor(m.difficulty, climbed)

            return (
              <button
                key={m.id}
                onClick={(e) => { e.stopPropagation(); onSelect(m) }}
                className="absolute flex flex-col items-center group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -100%)',
                  zIndex: isSelected ? 50 : 10,
                }}
              >
                {/* Pin */}
                <svg
                  width={isSelected ? 28 : 20}
                  height={isSelected ? 34 : 26}
                  viewBox="0 0 20 26"
                  className="drop-shadow-md transition-all duration-150"
                  style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(0,0,0,0.3))' : undefined }}
                >
                  <path
                    d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 16 10 16s10-8.5 10-16C20 4.5 15.5 0 10 0z"
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth="1"
                  />
                  {climbed && (
                    <text x="10" y="12" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold"
                      dominantBaseline="middle">&#10003;</text>
                  )}
                  {!climbed && (
                    <circle cx="10" cy="10" r="3.5" fill="white" opacity="0.5" />
                  )}
                </svg>

                {/* Label */}
                <span
                  className="whitespace-nowrap text-center font-bold leading-tight mt-0.5"
                  style={{
                    fontSize: isSelected ? 11 : 9,
                    color: '#374151',
                    textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white',
                  }}
                >
                  {m.name}
                </span>

                {isSelected && (
                  <span
                    className="whitespace-nowrap text-center leading-tight"
                    style={{
                      fontSize: 8,
                      color: '#6b7280',
                      textShadow: '0 0 3px white, 0 0 3px white',
                    }}
                  >
                    {m.height.toLocaleString()}m
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
