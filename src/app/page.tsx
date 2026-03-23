import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Sparkles, ListTree, Play, History, ShieldCheck } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: flavorCount } = await supabase.from('humor_flavors').select('*', { count: 'exact', head: true })
  const { count: stepCount } = await supabase.from('humor_flavor_steps').select('*', { count: 'exact', head: true })
  const { count: captionCount } = await supabase.from('captions').select('*', { count: 'exact', head: true })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-foreground italic tracking-tighter uppercase flex items-center gap-4">
             Flavor <span className="text-blue-500">Factory</span>
          </h1>
          <p className="text-foreground/60 font-medium text-xl">Design, Reorder, and Test Your Humor Prompt Chains</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-foreground/5 rounded-xl border border-border flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-xs font-black text-foreground/60 uppercase tracking-widest">{user?.email}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Humor Flavors', value: flavorCount, icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Prompt Steps', value: stepCount, icon: ListTree, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Total Captions', value: captionCount, icon: History, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map(stat => (
          <div key={stat.label} className={stat.bg + " p-8 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 bg-card"}>
            <stat.icon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform text-foreground" />
            <h3 className="text-xs font-black text-foreground/40 uppercase tracking-[0.3em] mb-4">{stat.label}</h3>
            <p className={stat.color + " text-6xl font-black italic tracking-tighter"}>{stat.value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Link href="/prompt-chain-tool" className="group bg-gradient-to-br from-blue-600 to-indigo-700 p-1 rounded-[3rem] shadow-2xl hover:shadow-blue-500/40 transition-all">
          <div className="bg-card/40 dark:bg-[#0f172a]/40 backdrop-blur-xl h-full w-full rounded-[2.8rem] p-10 flex flex-col justify-between group-hover:bg-transparent transition-colors">
             <div className="space-y-4">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
                   <Play className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Launch Prompt Tool</h2>
                <p className="text-white/80 font-medium">Test your flavor chains on the image test set and see the results instantly.</p>
             </div>
             <div className="mt-12 flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs">
                Enter Chain Lab <span className="group-hover:translate-x-2 transition-transform">→</span>
             </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 gap-8">
           <Link href="/humor-flavors" className="group bg-card border border-border p-8 rounded-[2.5rem] hover:bg-foreground/5 transition-all flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-foreground uppercase italic">Manage Flavors</h3>
                    <p className="text-sm text-foreground/40">Create and edit humor personalities</p>
                 </div>
              </div>
              <ChevronIcon />
           </Link>

           <Link href="/flavor-steps" className="group bg-card border border-border p-8 rounded-[2.5rem] hover:bg-foreground/5 transition-all flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                    <ListTree className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-foreground uppercase italic">Step Sequencer</h3>
                    <p className="text-sm text-foreground/40">Design the multi-stage logic chains</p>
                 </div>
              </div>
              <ChevronIcon />
           </Link>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg className="w-6 h-6 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
    </svg>
  )
}
