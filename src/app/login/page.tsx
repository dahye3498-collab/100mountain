'use client'

import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Mountain } from 'lucide-react'

const supabase = createClient()

export default function LoginPage() {
    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white border border-green-100 p-8 rounded-3xl shadow-xl text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="bg-emerald-100 p-5 rounded-full">
                        <Mountain className="w-12 h-12 text-emerald-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-gray-800 mb-2">100대 명산 지도</h1>
                <p className="text-gray-400 mb-8">나만의 등반 지도를 만들어보세요 🗺️</p>

                <button
                    onClick={handleLogin}
                    className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-gray-800 active:scale-95 shadow-md"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google 계정으로 로그인
                </button>

                <p className="text-xs text-gray-300 mt-6">대한민국 100대 명산을 지도 위에서 기록해요</p>
            </motion.div>
        </div>
    )
}
