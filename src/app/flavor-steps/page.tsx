'use client'

import { useState } from 'react'
import CRUDComponent from '@/components/CRUDComponent'
import { ListTree, ArrowUpDown } from 'lucide-react'
import ReorderSteps from '@/components/ReorderSteps'

export default function FlavorStepsPage() {
  const [showReorder, setShowReorder] = useState(false)

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-700 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 rounded-2xl">
            <ListTree className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic">Flavor Steps</h1>
            <p className="text-slate-400 font-medium">Manage the sequence of prompts for each flavor</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowReorder(!showReorder)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20"
        >
          <ArrowUpDown className="w-5 h-5" />
          {showReorder ? 'Show Table View' : 'Reorder Steps'}
        </button>
      </div>
      
      {showReorder ? (
        <ReorderSteps />
      ) : (
        <CRUDComponent tableKey="humor_flavor_steps" />
      )}
    </main>
  )
}
