'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Check, X, Loader2, LogOut } from 'lucide-react'
import { MOUNTAINS, MountainData } from '@/data/mountains'

const IllustratedMap = dynamic(() => import('./IllustratedMap'), { ssr: false })

const supabase = createClient()

const DIFFICULTY_LABEL: Record<string, string> = { 하: '쉬움', 중: '보통', 상: '어려움' }
const DIFFICULTY_COLOR: Record<string, string> = {
  하: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  중: 'bg-amber-100 text-amber-700 border-amber-200',
  상: 'bg-red-100 text-red-700 border-red-200',
}
const DIFFICULTY_EMOJI: Record<string, string> = { 하: '🌿', 중: '🥾', 상: '🧗' }

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
  const climbedCount = records.length
  const getRecord = (id: number) => records.find(r => r.mountain_id === String(id))

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

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function mountainEmoji(height: number) {
    if (height >= 1500) return '🗻'
    if (height >= 1000) return '⛰️'
    return '🏔️'
  }

  const progressPct = Math.round((climbedCount / 100) * 100)

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* ── Floating Header ── */}
      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="mx-3 mt-3 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xl">🗺️</span>
              <div>
                <p className="text-xs font-black text-gray-800 leading-tight">100대 명산</p>
                <p className="text-[10px] text-gray-400 leading-tight">핀을 눌러 기록하세요</p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 font-medium">달성률</span>
                <span className="text-[10px] font-black text-emerald-600">{climbedCount} / 100</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="w-full h-full">
        <IllustratedMap
          mountains={MOUNTAINS}
          climbedSet={climbedSet}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {/* ── Legend (floating bottom-right) ── */}
      <div className="absolute bottom-6 right-4 z-[999] bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2.5 shadow-md border border-gray-100 text-[11px] space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <svg width="12" height="11" viewBox="0 0 12 11"><polygon points="6,0 0,11 12,11" fill="#ef4444" /></svg>
          <span className="text-gray-500">어려움</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="12" height="11" viewBox="0 0 12 11"><polygon points="6,0 0,11 12,11" fill="#f97316" /></svg>
          <span className="text-gray-500">보통</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="12" height="11" viewBox="0 0 12 11"><polygon points="6,0 0,11 12,11" fill="#eab308" /></svg>
          <span className="text-gray-500">쉬움</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="12" height="11" viewBox="0 0 12 11"><polygon points="6,0 0,11 12,11" fill="#22c55e" /></svg>
          <span className="text-gray-500">등반 완료</span>
        </div>
      </div>

      {/* ── Bottom Drawer ── */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[1001]"
              onClick={() => { setSelected(null); setShowForm(false) }}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 z-[1002] bg-white rounded-t-3xl shadow-2xl"
              style={{ maxHeight: '62vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="overflow-y-auto" style={{ maxHeight: '62vh' }}>
                <div className="p-5 pb-8">
                  {/* Handle */}
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

                  {/* Close */}
                  <button
                    onClick={() => { setSelected(null); setShowForm(false) }}
                    className="absolute top-5 right-5 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Mountain info */}
                  <div className="flex items-start gap-3 mb-5 pr-10">
                    <div className="text-4xl leading-none select-none">{mountainEmoji(selected.height)}</div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-black text-gray-900 leading-tight">{selected.name}</h2>
                      <p className="text-gray-400 text-sm mt-0.5">
                        📍 {selected.region}&nbsp;&nbsp;·&nbsp;&nbsp;{selected.height.toLocaleString()}m
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${DIFFICULTY_COLOR[selected.difficulty] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {DIFFICULTY_EMOJI[selected.difficulty]} {DIFFICULTY_LABEL[selected.difficulty]}
                    </span>
                  </div>

                  {/* Record section */}
                  {getRecord(selected.id) ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3"
                    >
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-200">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-emerald-700">정복 완료! 🎉</p>
                        <p className="text-emerald-500 text-sm mt-0.5">
                          {new Date(getRecord(selected.id)!.climbed_at).toLocaleDateString('ko-KR', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                        {getRecord(selected.id)!.memo && (
                          <p className="text-emerald-400 text-xs mt-1.5 leading-relaxed line-clamp-3">
                            {getRecord(selected.id)!.memo}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : showForm ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">📅 등반 날짜</label>
                        <input
                          type="date"
                          value={climbedAt}
                          onChange={e => setClimbedAt(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">📝 메모 (선택)</label>
                        <textarea
                          value={memo}
                          onChange={e => setMemo(e.target.value)}
                          placeholder="날씨, 코스, 동행, 소감..."
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setShowForm(false)}
                          className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex-[2] py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-md shadow-emerald-100"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '✅ 기록 저장'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-100 hover:shadow-amber-200 active:scale-[0.98] transition-all"
                    >
                      🏔️ 이 산 올랐어요!
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
