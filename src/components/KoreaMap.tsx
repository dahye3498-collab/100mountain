'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Check, X, Loader2 } from 'lucide-react'
import { MOUNTAINS, MountainData } from '@/data/mountains'

// SVG map coordinate system
const W = 400
const H = 560
const LNG_MIN = 125.5
const LNG_MAX = 130.5
const LAT_MAX = 39.2
const LAT_MIN = 32.5

function toX(lng: number) {
  return ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W
}
function toY(lat: number) {
  return ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H
}

// Simplified South Korea mainland outline path
const KOREA_PATH =
  'M 78 74 L 192 48 L 280 67 L 280 100 L 312 142 L 328 184 L 320 226 L 328 268 L 312 309 L 288 343 L 256 360 L 232 376 L 200 393 L 176 410 L 152 418 L 128 410 L 104 393 L 96 385 L 80 368 L 80 351 L 80 326 L 80 301 L 88 285 L 88 268 L 80 242 L 80 226 L 88 209 L 96 184 L 88 159 L 88 142 L 64 117 L 64 100 Z'

const supabase = createClient()

const DIFFICULTY_LABEL: Record<string, string> = {
  하: '쉬움',
  중: '보통',
  상: '어려움',
}
const DIFFICULTY_COLOR: Record<string, string> = {
  하: 'bg-emerald-100 text-emerald-700',
  중: 'bg-amber-100 text-amber-700',
  상: 'bg-red-100 text-red-700',
}
const DIFFICULTY_EMOJI: Record<string, string> = {
  하: '🌿',
  중: '🥾',
  상: '🧗',
}

interface ClimbRecord {
  id: string
  mountain_id: string
  climbed_at: string
  memo: string
}

interface Props {
  initialRecords: ClimbRecord[]
  userId: string
}

export function KoreaMap({ initialRecords, userId }: Props) {
  const [records, setRecords] = useState<ClimbRecord[]>(initialRecords)
  const [selected, setSelected] = useState<MountainData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [climbedAt, setClimbedAt] = useState(new Date().toISOString().split('T')[0])
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)

  const climbedSet = new Set(records.map(r => r.mountain_id))
  const getRecord = (id: number) => records.find(r => r.mountain_id === String(id))
  const climbedCount = records.length

  function handleSelect(m: MountainData) {
    setSelected(m)
    setShowForm(false)
    setMemo('')
    setClimbedAt(new Date().toISOString().split('T')[0])
  }

  async function handleSave() {
    if (!selected) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('climb_records')
        .insert({
          user_id: userId,
          mountain_id: String(selected.id),
          climbed_at: climbedAt,
          memo,
          photos: [],
        })
        .select()
        .single()
      if (error) throw error
      setRecords(prev => [...prev, data])
      setShowForm(false)
      setMemo('')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  function mountainEmoji(height: number) {
    if (height >= 1500) return '🗻'
    if (height >= 1000) return '⛰️'
    return '🏔️'
  }

  return (
    <div className="flex flex-col h-screen bg-green-50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-white border-b border-green-100 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          <div>
            <h1 className="text-sm font-black text-gray-800 leading-tight">100대 명산 지도</h1>
            <p className="text-[11px] text-gray-400">핀을 눌러 등반 기록을 남겨보세요</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-emerald-600 leading-tight">
            {climbedCount}
            <span className="text-xs text-gray-400 font-medium"> / 100</span>
          </p>
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${climbedCount}%` }}
            />
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Sea pattern */}
          <defs>
            <pattern id="wavePattern" patternUnits="userSpaceOnUse" width="28" height="28">
              <path
                d="M 0 14 Q 7 7 14 14 Q 21 21 28 14"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="1"
                opacity="0.5"
              />
            </pattern>
          </defs>

          {/* Sea background */}
          <rect width={W} height={H} fill="#eff6ff" />
          <rect width={W} height={H} fill="url(#wavePattern)" />

          {/* Sea name labels */}
          <text x="22" y="300" fill="#93c5fd" fontSize="9" fontWeight="bold" opacity="0.9" transform="rotate(-90 22 300)">서해</text>
          <text x="388" y="260" fill="#93c5fd" fontSize="9" fontWeight="bold" opacity="0.9" transform="rotate(90 388 260)">동해</text>
          <text x="210" y="450" fill="#93c5fd" fontSize="9" fontWeight="bold" opacity="0.9" textAnchor="middle">남해</text>

          {/* Korea mainland */}
          <path
            d={KOREA_PATH}
            fill="#dcfce7"
            stroke="#86efac"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Jeju island */}
          <ellipse cx="82" cy="488" rx="32" ry="14" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />

          {/* Mountain pins */}
          {MOUNTAINS.map(m => {
            const x = toX(m.lng)
            const y = toY(m.lat)
            const climbed = climbedSet.has(String(m.id))
            const isSelected = selected?.id === m.id
            const pinSize = isSelected ? 9 : 7

            return (
              <g
                key={m.id}
                onClick={() => handleSelect(m)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection glow ring */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill={climbed ? '#bbf7d0' : '#fef3c7'}
                    stroke={climbed ? '#34d399' : '#fbbf24'}
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                )}

                {/* Mountain triangle marker */}
                <polygon
                  points={`${x},${y - pinSize} ${x - pinSize * 0.9},${y + pinSize * 0.5} ${x + pinSize * 0.9},${y + pinSize * 0.5}`}
                  fill={climbed ? '#22c55e' : '#fbbf24'}
                  stroke={climbed ? '#16a34a' : '#d97706'}
                  strokeWidth="0.8"
                />

                {/* Checkmark on climbed mountains */}
                {climbed && (
                  <text
                    x={x}
                    y={y + 1.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={pinSize * 0.85}
                    fill="white"
                    fontWeight="bold"
                  >
                    ✓
                  </text>
                )}

                {/* Name label for selected pin */}
                {isSelected && (
                  <text
                    x={x}
                    y={y - pinSize - 7}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#1f2937"
                    stroke="white"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >
                    {m.name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-green-100 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="10" viewBox="0 0 12 10">
              <polygon points="6,0 0,10 12,10" fill="#fbbf24" />
            </svg>
            <span className="text-gray-500">미등반</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="10" viewBox="0 0 12 10">
              <polygon points="6,0 0,10 12,10" fill="#22c55e" />
            </svg>
            <span className="text-gray-500">등반 완료</span>
          </div>
        </div>
      </div>

      {/* Bottom drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl"
            style={{ maxHeight: '58vh', overflowY: 'auto' }}
          >
            <div className="p-5 pb-8">
              {/* Drag handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              {/* Close */}
              <button
                onClick={() => { setSelected(null); setShowForm(false) }}
                className="absolute top-5 right-5 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              {/* Mountain header */}
              <div className="flex items-start gap-3 mb-5 pr-10">
                <span className="text-4xl leading-none">{mountainEmoji(selected.height)}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-gray-800 leading-tight">{selected.name}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    📍 {selected.region} &nbsp;·&nbsp; {selected.height.toLocaleString()}m
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${DIFFICULTY_COLOR[selected.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                  {DIFFICULTY_EMOJI[selected.difficulty]} {DIFFICULTY_LABEL[selected.difficulty]}
                </span>
              </div>

              {/* Record section */}
              {getRecord(selected.id) ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-700">정복 완료! 🎉</p>
                    <p className="text-emerald-600 text-sm">
                      {new Date(getRecord(selected.id)!.climbed_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {getRecord(selected.id)!.memo && (
                      <p className="text-emerald-500 text-xs mt-1 line-clamp-2">{getRecord(selected.id)!.memo}</p>
                    )}
                  </div>
                </div>
              ) : showForm ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">📅 등반 날짜</label>
                    <input
                      type="date"
                      value={climbedAt}
                      onChange={e => setClimbedAt(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">📝 메모 (선택)</label>
                    <textarea
                      value={memo}
                      onChange={e => setMemo(e.target.value)}
                      placeholder="날씨, 코스, 동행, 소감 등을 자유롭게 적어보세요"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-[2] py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-600 active:scale-95 transition-all"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '✅ 기록 저장!'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:shadow-emerald-200 active:scale-95 transition-all"
                >
                  🏔️ 이 산 올랐어요!
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
