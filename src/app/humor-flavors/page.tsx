'use client'

import CRUDComponent from '@/components/CRUDComponent'
import { Sparkles } from 'lucide-react'

export default function HumorFlavorsPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-700 pb-6">
        <div className="p-3 bg-blue-600/10 rounded-2xl">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white italic">Humor Flavors</h1>
          <p className="text-slate-400 font-medium">Define different styles of humor for your captions</p>
        </div>
      </div>
      
      <CRUDComponent tableKey="humor_flavors" />
    </main>
  )
}
