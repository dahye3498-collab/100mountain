'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mountain, Calendar, FileText, Camera, X, Check, Loader2, ChevronLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { Mountain as MountainType } from '@/types/database'

const supabase = createClient()

export default function NewRecordPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [mountains, setMountains] = useState<MountainType[]>([])
    const [selectedMountain, setSelectedMountain] = useState('')
    const [climbedAt, setClimbedAt] = useState(new Date().toISOString().split('T')[0])
    const [memo, setMemo] = useState('')
    const [photos, setPhotos] = useState<File[]>([])
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

    useEffect(() => {
        const fetchMountains = async () => {
            const { data } = await supabase.from('mountains').select('*').order('name')
            if (data) setMountains(data)
        }
        fetchMountains()
    }, [])

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setPhotos((prev) => [...prev, ...newFiles])

            const newPreviews = newFiles.map(file => URL.createObjectURL(file))
            setPhotoPreviews((prev) => [...prev, ...newPreviews])
        }
    }

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index))
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMountain) return alert('산을 선택해 주세요!')
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Unauthenticated')

            // 1. Upload Photos to Supabase Storage
            const uploadedPhotoUrls: string[] = []
            for (const file of photos) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`

                const { error: uploadError, data } = await supabase.storage
                    .from('climb-photos')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('climb-photos')
                    .getPublicUrl(fileName)

                uploadedPhotoUrls.push(publicUrl)
            }

            // 2. Insert Record
            const { error: insertError } = await supabase
                .from('climb_records')
                .insert({
                    user_id: user.id,
                    mountain_id: selectedMountain,
                    climbed_at: climbedAt,
                    memo: memo,
                    photos: uploadedPhotoUrls
                })

            if (insertError) throw insertError

            router.push('/')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            alert('기록 저장 중 오류가 발생했습니다: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pb-12">
            <nav className="p-6 border-b border-white/5 bg-slate-950/50 flex items-center justify-between sticky top-0 backdrop-blur-md z-30">
                <Link href="/" className="flex items-center gap-2 group text-slate-400 hover:text-emerald-400 transition-colors">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold uppercase tracking-tighter italic">BACK TO FEED</span>
                </Link>
                <h1 className="font-black italic tracking-tighter text-lg">NEW <span className="text-emerald-400 font-black">RECORD</span></h1>
                <div className="w-10" />
            </nav>

            <main className="max-w-2xl mx-auto p-6 mt-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 border-white/10 shadow-2xl space-y-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Mountain Selector */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                <Mountain className="w-3 h-3" /> SELECT PEAK
                            </label>
                            <select
                                value={selectedMountain}
                                onChange={(e) => setSelectedMountain(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold appearance-none cursor-pointer"
                                required
                            >
                                <option value="">산을 선택하세요...</option>
                                {mountains.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.region})</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Selector */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                                <Calendar className="w-3 h-3" /> DATE OF CLIMB
                            </label>
                            <input
                                type="date"
                                value={climbedAt}
                                onChange={(e) => setClimbedAt(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/30 transition-all font-bold"
                                required
                            />
                        </div>

                        {/* Memo */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <FileText className="w-3 h-3" /> NOTES & MEMO
                            </label>
                            <textarea
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                placeholder="오늘의 등반은 어떠셨나요?"
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-white/20 transition-all font-medium min-h-[120px]"
                            />
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-400">
                                <Camera className="w-3 h-3" /> UPLOAD PHOTOS
                            </label>

                            <div className="grid grid-cols-3 gap-3">
                                <AnimatePresence>
                                    {photoPreviews.map((preview, i) => (
                                        <motion.div
                                            key={preview}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            className="relative aspect-square rounded-xl overflow-hidden group"
                                        >
                                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <label className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-emerald-500/30 transition-all">
                                    <Plus className="w-6 h-6 text-slate-500" />
                                    <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loading}
                            className="w-full bg-emerald-500 text-slate-950 font-black py-5 rounded-2xl shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3 enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-50 italic uppercase"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-6 h-6" /> SAVE RECORD
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    )
}
