'use client'

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-red-500/20 p-8 rounded-2xl shadow-2xl text-center"
            >
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-500/20 p-4 rounded-full">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">인증 오류</h1>
                <p className="text-slate-400 mb-8">
                    로그인 처리 중 문제가 발생했습니다. <br />
                    다시 시도해 주세요.
                </p>

                <Link
                    href="/login"
                    className="inline-block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                >
                    로그인 페이지로 돌아가기
                </Link>
            </motion.div>
        </div>
    )
}
