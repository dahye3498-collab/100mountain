'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { MountainData } from '@/data/mountains'

// Korea coordinate bounds
const MAP_BOUNDS = {
  latMin: 33.0,
  latMax: 38.8,
  lngMin: 124.5,
  lngMax: 130.0,
}

// Where Korea actually sits within the square image (%)
const IMG = {
  xStart: 17,
  yStart: 4,
  xEnd: 73,
  yEnd: 82,
}

function latLngToPercent(lat: number, lng: number): { x: number; y: number } {
  const xRatio = (lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)
  const yRatio = 1 - (lat - MAP_BOUNDS.latMin) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)
  return {
    x: IMG.xStart + xRatio * (IMG.xEnd - IMG.xStart),
    y: IMG.yStart + yRatio * (IMG.yEnd - IMG.yStart),
  }
}

function getMountainColor(difficulty: string, climbed: boolean) {
  if (climbed) return { fill: '#22c55e', stroke: '#15803d', snow: '#d1fae5' }
  if (difficulty === '\uc0c1') return { fill: '#ef4444', stroke: '#b91c1c', snow: '#fecaca' }
  if (difficulty === '\uc911') return { fill: '#f97316', stroke: '#c2410c', snow: '#fed7aa' }
  return { fill: '#eab308', stroke: '#a16207', snow: '#fef08a' }
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

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale(prev => clamp(prev + (e.deltaY > 0 ? -0.15 : 0.15), 0.8, 4))
  }, [clamp])

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
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          /* Image is square — size it to viewport height so it's big enough */
          width: '100vh',
          height: '100vh',
          position: 'absolute',
          left: '50%',
          top: '0',
          marginLeft: '-50vh',
        }}
      >
        {/* The image and pins share the same coordinate space */}
        <div className="relative w-full h-full">
          <img
            src="/images/Gemini_Generated_Image_jwdisbjwdisbjwdi.png"
            alt="Korea Map"
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            draggable={false}
          />

          {/* Mountain markers */}
          {mountains.map(m => {
            const { x, y } = latLngToPercent(m.lat, m.lng)
            const climbed = climbedSet.has(String(m.id))
            const isSelected = selected?.id === m.id
            const colors = getMountainColor(m.difficulty, climbed)

            return (
              <button
                key={m.id}
                onClick={(e) => { e.stopPropagation(); onSelect(m) }}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -100%) scale(${isSelected ? 1.5 : 1})`,
                  zIndex: isSelected ? 50 : 10,
                  transition: 'transform 0.15s ease-out',
                }}
              >
                {/* Mountain triangle */}
                <svg width="18" height="16" viewBox="0 0 22 20" className="drop-shadow-sm">
                  <polygon
                    points="11,1 1,19 21,19"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="11,1 7.5,8 14.5,8"
                    fill={colors.snow}
                    opacity="0.7"
                    strokeLinejoin="round"
                  />
                  {climbed && (
                    <text x="11" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold"
                      dominantBaseline="middle">&#10003;</text>
                  )}
                </svg>

                {/* Name label */}
                <span
                  className="whitespace-nowrap text-center font-bold leading-none"
                  style={{
                    fontSize: isSelected ? 10 : 7,
                    color: '#374151',
                    textShadow: '0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white',
                    marginTop: -1,
                  }}
                >
                  {m.name}
                </span>

                {isSelected && (
                  <span
                    className="whitespace-nowrap text-center leading-none"
                    style={{ fontSize: 7, color: '#6b7280', textShadow: '0 0 2px white, 0 0 2px white' }}
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
