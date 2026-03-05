'use client'

import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Mountain } from 'lucide-react'

export default function LoginPage() {
    const supabase = createClient()

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="bg-emerald-500/20 p-4 rounded-full">
                        <Mountain className="w-12 h-12 text-emerald-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">100대 명산 서비스</h1>
                <p className="text-slate-400 mb-8">당신의 등반 역사를 기록하세요</p>

                <button
                    onClick={handleLogin}
                    className="w-full bg-white text-slate-950 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-slate-200 active:scale-95"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                        />
                    </svg>
                    Google 계정으로 로그인
                </button>
            </motion.div>
        </div>
    )
}
