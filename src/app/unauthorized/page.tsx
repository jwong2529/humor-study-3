import Link from 'next/link'
import AuthButton from '@/components/AuthButton'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 w-full flex flex-col items-center justify-center p-8 text-center">
            <div className="p-12 bg-red-900/10 rounded-3xl border border-red-500/20 max-w-xl shadow-2xl">
                <h1 className="text-4xl font-black text-red-500 mb-6 uppercase tracking-tighter italic">Access Restricted</h1>
                <p className="text-slate-400 mb-10 text-lg leading-relaxed font-medium">
                    You do not have the required permissions to access this tool. 
                    <br/>Admin access is restricted to authorized profiles only.
                </p>
                <div className="flex flex-col items-center gap-6">
                    <AuthButton />
                    <Link href="/login" className="text-slate-500 hover:text-white transition-colors text-sm font-bold underline decoration-slate-700 underline-offset-4">
                        Try signing in with a different account
                    </Link>
                </div>
            </div>
        </div>
    )
}
