import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mountain, Plus, History, Trophy, Search, ChevronRight } from 'lucide-react'
import { Mountain as MountainType } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch mountains
  const { data: mountains } = await supabase
    .from('mountains')
    .select('*')
    .order('name', { ascending: true })
    .limit(10)

  // Fetch record count (현재 유저의 기록만)
  const { count: recordCount } = await supabase
    .from('climb_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <main className="min-h-screen pb-24 bg-slate-950 text-slate-50">
      {/* Premium Hero Section with Map */}
      <div className="relative h-[450px] w-full overflow-hidden">
        <Image
          src="/images/hero-map.png"
          alt="Mountain Map"
          fill
          className="object-cover opacity-50 grayscale-[0.2]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/50 to-slate-950" />

        <div className="absolute inset-0 flex flex-col justify-end p-8 max-w-5xl mx-auto w-full">
          <div className="space-y-4 mb-10">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic leading-none">
              EXPLORE THE<br /><span className="text-emerald-400">HIGHEST PEAKS.</span>
            </h1>
            <p className="text-slate-400 max-w-lg text-lg font-medium leading-relaxed">
              대한민국 100대 명산 정복 프로젝트. <br />
              당신의 성취를 고해상도 디지털 지도로 영원히 기록하세요.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 flex flex-col justify-center border-emerald-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">달성률</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white">{recordCount ?? 0}</span>
                <span className="text-sm font-bold text-slate-500 mb-1.5">/ 100</span>
              </div>
            </div>
            <div className="glass-card p-5 flex flex-col justify-center border-blue-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">최근 고도</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white">0</span>
                <span className="text-sm font-bold text-slate-500 mb-1.5">M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6 space-y-12 relative z-10">
        {/* Modern Search Bar */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-emerald-400 transition-all duration-300" />
          <input
            type="text"
            placeholder="명산 검색 (북한산, 설악산, 한라산...)"
            className="w-full bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl py-6 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] placeholder:text-slate-600"
          />
        </div>

        {/* Mountain Categories */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {['강원', '경기', '경상', '전라', '충청', '제주'].map((region) => (
            <button key={region} className="px-8 py-3 rounded-2xl bg-white/5 border border-white/5 text-sm font-black whitespace-nowrap hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all uppercase tracking-tighter">
              {region}
            </button>
          ))}
        </div>

        {/* Featured Mountains Grid */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase whitespace-pre line-clamp-1">FEATURED <span className="text-emerald-400 underline decoration-emerald-500/30 decoration-8 underline-offset-4">MOUNTAINS</span></h2>
            </div>
            <Link href="/mountains" className="text-slate-500 text-sm font-black hover:text-emerald-400 transition-all flex items-center gap-2 group">
              VIEW 100 LIST <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mountains?.length === 0 ? (
              <div className="glass-card col-span-full p-24 text-center border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
                <Mountain className="w-16 h-16 text-slate-800" />
                <div className="space-y-1">
                  <p className="text-slate-500 font-black text-xl italic uppercase">NO PEAKS FOUND</p>
                  <p className="text-slate-600 text-sm font-medium">SQL Editor를 사용하여 명산 데이터를 추가해 주세요.</p>
                </div>
              </div>
            ) : (
              mountains?.map((mountain: MountainType) => (
                <Link key={mountain.id} href={`/mountains/${mountain.id}`} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-slate-900 border border-white/5 hover:border-emerald-500/40 transition-all shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />

                  {/* Decorative Background Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                    <Mountain className="w-64 h-64 text-white" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none flex items-center justify-center">
                        {mountain.difficulty}
                      </span>
                    </div>
                    <h4 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic leading-tight mb-1">{mountain.name}</h4>
                    <p className="text-slate-500 text-sm font-bold italic tracking-tight">{mountain.region} AREA · {mountain.height.toLocaleString()}M</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Extreme Floating Action Button */}
      <Link
        href="/records/new"
        className="fixed bottom-10 right-10 w-20 h-20 bg-emerald-500 text-slate-950 rounded-[40%] shadow-[0_20px_50px_rgba(16,185,129,0.5)] flex items-center justify-center transition-all hover:scale-110 hover:rounded-2xl active:scale-95 z-30 group"
      >
        <Plus className="w-10 h-10 transition-transform group-hover:rotate-180 duration-500" />
      </Link>
    </main>
  )
}
