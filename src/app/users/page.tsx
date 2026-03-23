import { createClient } from '@/utils/supabase/server'
import { Users, ShieldCheck, Mail, Calendar, Key } from 'lucide-react'

export default async function UsersPage() {
    const supabase = await createClient()
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_datetime_utc', { ascending: false })

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-700 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Users Directory</h1>
                    </div>
                    <p className="text-slate-400 font-medium text-lg">Manage access and review authorized profiles.</p>
                </div>
            </header>

            {error ? (
                <div className="p-4 bg-red-900/20 text-red-200 border border-red-500/50 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Error loading profiles: {error.message}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles?.map((profile: any) => (
                        <div key={profile.id} className="bg-[#1e293b] border border-slate-700 rounded-[2rem] p-6 shadow-2xl hover:border-blue-500/50 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700 group-hover:border-blue-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl italic shadow-lg">
                                        {profile.email ? profile.email[0].toUpperCase() : '?'}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {profile.is_superadmin && (
                                        <span className="bg-red-500/10 text-red-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-red-500/20 shadow-xl flex items-center gap-1">
                                            <ShieldCheck className="w-2 h-2" /> Superadmin
                                        </span>
                                    )}
                                    {profile.is_matrix_admin && (
                                        <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-indigo-500/20 shadow-xl flex items-center gap-1">
                                            <Key className="w-2 h-2" /> Matrix Admin
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Email
                                    </p>
                                    <p className="text-white font-medium truncate">{profile.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Registered
                                    </p>
                                    <p className="text-slate-400 text-sm font-medium">
                                        {profile.created_datetime_utc ? new Date(profile.created_datetime_utc).toLocaleDateString() : 'Historical'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <span className="text-[10px] font-mono text-slate-600 select-all truncate block">ID: {profile.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
