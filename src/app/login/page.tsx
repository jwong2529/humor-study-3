import AuthButton from '@/components/AuthButton'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 w-full flex flex-col items-center justify-center p-8">
            <div className="p-8 bg-slate-800/50 rounded-3xl border border-slate-700 max-w-md text-center">
                <h1 className="text-3xl font-black text-white mb-4 italic">Humor Study 3</h1>
                <p className="text-slate-400 mb-8 font-medium">Please sign in to access the Prompt Chain Tool & Admin Area.</p>
                <div className="flex justify-center">
                    <AuthButton />
                </div>
            </div>
        </div>
    )
}
