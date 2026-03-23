'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { FileText, Search, Sparkles, User, Calendar, BrainCircuit, Image as ImageIcon } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function CaptionsPage() {
  const [captions, setCaptions] = useState<any[]>([])
  const [flavors, setFlavors] = useState<any[]>([])
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchFlavors = async () => {
      const { data } = await supabase.from('humor_flavors').select('*').order('slug')
      if (data) setFlavors(data)
    }
    fetchFlavors()
  }, [supabase])

  useEffect(() => {
    const fetchCaptions = async () => {
      setLoading(true)
      let query = supabase
        .from('captions')
        .select(`
          *,
          images (url),
          profiles!profile_id (email),
          humor_flavors!humor_flavor_id (*)
        `)
        .order('created_datetime_utc', { ascending: false })
        .limit(100)

      if (selectedFlavorId !== 'all') {
        query = query.eq('humor_flavor_id', selectedFlavorId)
      }

      const { data } = await query
      if (data) setCaptions(data)
      setLoading(false)
    }
    fetchCaptions()
  }, [selectedFlavorId, supabase])

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-600/20 rounded-lg">
                <FileText className="w-6 h-6 text-purple-400" />
             </div>
             <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">Captions Registry</h1>
          </div>
          <p className="text-foreground/60 font-medium text-lg">History of all generated captions and experiments.</p>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-2 flex items-center gap-1">
             <Search className="w-2 h-2" /> Filter by Flavor
          </label>
          <select
            value={selectedFlavorId}
            onChange={(e) => setSelectedFlavorId(e.target.value)}
            className="w-64 bg-background border border-border rounded-2xl px-4 py-3 text-foreground focus:border-purple-500 outline-none transition-all cursor-pointer font-bold"
          >
            <option value="all">All Humor Flavors</option>
            {flavors.map(flav => (
              <option key={flav.id} value={flav.id}>{flav.slug}</option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
           <LoaderCircle className="w-16 h-16 animate-spin text-purple-500" />
           <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Curating Gallery...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {captions.map((cap) => (
            <div key={cap.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-purple-500/50 transition-all group/card flex flex-col">
              <div className="relative aspect-square bg-background overflow-hidden">
                 {cap.images?.url ? (
                   <img src={cap.images.url} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 pointer-events-none" alt="context" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-700"><ImageIcon className="w-12 h-12" /></div>
                 )}
                 <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic shadow-xl">
                       {cap.humor_flavors?.slug || 'Base Flavor'}
                    </span>
                    {cap.like_count > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic shadow-xl">
                        ♥ {cap.like_count}
                      </span>
                    )}
                 </div>
              </div>

              <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div className="relative pl-6 border-l-4 border-border group-hover/card:border-purple-500 transition-all">
                  <p className="text-lg text-foreground font-medium leading-relaxed italic">
                     "{cap.content || "Empty caption"}"
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <User className="w-3 h-3" /> {cap.profiles?.email?.split('@')[0] || "AI System"}
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3" /> {mounted && cap.created_datetime_utc ? new Date(cap.created_datetime_utc).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!captions.length && (
            <div className="col-span-full py-32 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-[3rem]">
               <BrainCircuit className="w-16 h-16 text-slate-700 mx-auto mb-6" />
               <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm italic">No data matched the criteria</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

function LoaderCircle({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  )
}
