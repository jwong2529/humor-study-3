'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Sparkles, 
  Image as ImageIcon, 
  ChevronRight, 
  Loader2, 
  Play, 
  History,
  CheckCircle2,
  AlertCircle,
  Layers,
  ListTree
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function PromptChainTool() {
  const [images, setImages] = useState<any[]>([])
  const [flavors, setFlavors] = useState<any[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string>('')
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>('')
  const [steps, setSteps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [flavorSearch, setFlavorSearch] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: imgData } = await supabase.from('images').select('*').limit(20).order('created_datetime_utc', { ascending: false })
      const { data: flavData } = await supabase.from('humor_flavors').select('*').order('slug')
      if (imgData) setImages(imgData)
      if (flavData) setFlavors(flavData)
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  useEffect(() => {
    if (!selectedFlavorId) {
      setSteps([])
      return
    }
    const fetchSteps = async () => {
      const { data } = await supabase
        .from('humor_flavor_steps')
        .select('*')
        .eq('humor_flavor_id', selectedFlavorId)
        .order('order_by')
      if (data) setSteps(data)
    }
    fetchSteps()
  }, [selectedFlavorId, supabase])

  const handleGenerate = async () => {
    if (!selectedImageId || !selectedFlavorId) return
    setGenerating(true)
    setError(null)
    setStatus('Initializing pipeline...')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Authentication required")

      setStatus('Running humor flavor chain...')
      const response = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId: selectedImageId,
          humorFlavorId: selectedFlavorId // Passing flavor ID to the API
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errText}`)
      }

      const data = await response.json()
      setResults(data)
      setStatus('Success! Captions generated.')
    } catch (err: any) {
      setError(err.message)
      setStatus('')
    } finally {
      setGenerating(false)
    }
  }

  const selectedImage = images.find(img => img.id === selectedImageId)
  
  const filteredFlavors = flavors.filter(f => 
    f.slug?.toLowerCase().includes(flavorSearch.toLowerCase()) || 
    f.description?.toLowerCase().includes(flavorSearch.toLowerCase())
  )

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-blue-400" />
             </div>
             <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">Prompt Chain Tool</h1>
          </div>
          <p className="text-foreground/60 font-medium text-lg">Test your humor flavors and generate captions in real-time.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* CONFIGURATION COLUMN */}
        <div className="lg:col-span-5 space-y-8">
          {/* IMAGE SELECTION */}
          <section className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ImageIcon className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2 italic uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">01</span>
                Image Test Set
              </h2>
              
              <div className="grid grid-cols-4 gap-3">
                {images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageId(img.id)}
                    className={cn(
                      "aspect-square rounded-xl overflow-hidden border-2 transition-all relative group/img",
                      selectedImageId === img.id ? "border-blue-500 shadow-xl shadow-blue-500/20 scale-105 z-10" : "border-border/50 hover:border-border"
                    )}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="test" />
                    {selectedImageId === img.id && (
                       <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white shadow-lg" />
                       </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-2">Select an image to process</p>
            </div>
          </section>

          {/* FLAVOR SELECTION */}
          <section className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-foreground flex items-center gap-2 italic uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">02</span>
                  Humor Flavor
                </h2>
              </div>
              
              {/* SEARCH BAR */}
              <div className="relative group/search">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <ListTree className="w-4 h-4 text-indigo-400/50 group-focus-within/search:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search flavors..."
                  value={flavorSearch}
                  onChange={(e) => setFlavorSearch(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500/50 focus:bg-foreground/[0.08] transition-all"
                />
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredFlavors.length > 0 ? (
                  filteredFlavors.map(flav => (
                    <button
                      key={flav.id}
                      onClick={() => setSelectedFlavorId(flav.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group/flav",
                        selectedFlavorId === flav.id ? "bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10" : "bg-foreground/5 border-border/50 hover:border-border"
                      )}
                    >
                      <div className="min-w-0">
                        <h3 className={cn("font-black uppercase tracking-tight transition-colors truncate", selectedFlavorId === flav.id ? "text-indigo-400" : "text-foreground")}>{flav.slug}</h3>
                        <p className="text-[10px] text-foreground/50 font-medium truncate">{flav.description}</p>
                      </div>
                      {selectedFlavorId === flav.id && <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center bg-foreground/5 rounded-2xl border border-dashed border-border/50">
                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest italic">No match found</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RUN BUTTON */}
          <button
            onClick={handleGenerate}
            disabled={!selectedImageId || !selectedFlavorId || generating}
            className={cn(
              "w-full py-6 rounded-3xl font-black text-xl uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-4 relative overflow-hidden group/btn",
              (!selectedImageId || !selectedFlavorId) 
                ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40"
            )}
          >
            {generating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Play className="w-8 h-8 group-hover/btn:scale-110 transition-transform" />}
            {generating ? 'Processing...' : 'Generate Captions'}
            {generating && (
              <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none"></div>
            )}
          </button>

          {status && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              {status}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* RESULTS / CHAIN PREVIEW COLUMN */}
        <div className="lg:col-span-7 space-y-12">
          {/* CHAIN PREVIEW */}
          {selectedFlavorId && (
            <section className="bg-card border border-border rounded-3xl p-8 backdrop-blur-xl overflow-hidden">
              <h2 className="text-xs font-black text-foreground/50 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <ListTree className="w-4 h-4" />
                Prompt Chain Sequence
              </h2>
              <div className="space-y-6 relative">
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border/50"></div>
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-6 relative">
                    <div className="w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center text-[10px] font-black text-blue-400 z-10 shrink-0 shadow-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 bg-background border border-border rounded-2xl p-4 hover:border-foreground/20 transition-colors space-y-2 shadow-sm">
                      <div>
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-1">System Prompt:</span>
                        <p className="text-foreground text-sm font-medium italic line-clamp-2">"{step.llm_system_prompt}"</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-1">User Prompt:</span>
                        <p className="text-foreground/70 text-[13px] font-medium leading-relaxed italic line-clamp-2">"{step.llm_user_prompt}"</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model:</span>
                          <span className="text-[10px] font-mono text-blue-400">{step.llm_model_id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Temp:</span>
                          <span className="text-[10px] font-mono text-indigo-400">{step.llm_temperature}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RESULTS */}
          {results.length > 0 || generating ? (
             <section className="space-y-8 h-full min-h-[500px]">
                <h2 className="text-xs font-black text-foreground/50 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Generated Results
                </h2>
                
                {generating ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
                      <Loader2 className="w-16 h-16 animate-spin text-blue-500 relative z-10" />
                    </div>
                    <p className="text-slate-400 font-medium animate-pulse">AI is thinking about something funny...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8">
                    {results.map((res, idx) => (
                      <div key={idx} className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl group/card">
                        <div className="bg-foreground/5 px-6 py-4 flex justify-between items-center border-b border-border">
                           <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Option {idx + 1}</span>
                           <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic">Premium Flavor</span>
                        </div>
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-64 aspect-square bg-background shrink-0">
                            {selectedImage && <img src={selectedImage.url} alt="context" className="w-full h-full object-contain" />}
                          </div>
                          <div className="p-8 flex-1 flex flex-col justify-center">
                            <div className="relative pl-6 border-l-4 border-blue-500/30 group-hover/card:border-blue-500 transition-all">
                               <p className="text-xl text-foreground font-medium leading-relaxed italic">
                                  {res.content || res.text || (typeof res === 'string' ? res : JSON.stringify(res))}
                               </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </section>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-30 select-none">
                <div className="p-8 bg-slate-800/50 rounded-full border border-slate-700">
                  <Play className="w-16 h-16 text-slate-600" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm">Waiting for generation</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
