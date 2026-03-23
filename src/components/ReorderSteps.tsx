'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Loader2, GripVertical, Save, Sparkles } from 'lucide-react'

interface Step {
  id: string
  description: string
  order_by: number
  humor_flavor_id: string
}

interface Flavor {
  id: string
  slug: string
  description: string
}

function SortableItem({ step }: { step: Step }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-2xl p-4 mb-3 flex items-center gap-4 group hover:border-blue-500/50 transition-colors shadow-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-foreground/5 rounded-lg transition-colors">
        <GripVertical className="w-5 h-5 text-foreground/40 group-hover:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
            Step {step.order_by}
          </span>
          <p className="text-sm text-foreground/40 truncate font-mono text-[10px]">{step.id}</p>
        </div>
        <p className="text-foreground text-sm font-medium line-clamp-2">{step.description}</p>
      </div>
    </div>
  )
}

export default function ReorderSteps() {
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>('')
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const fetchFlavors = async () => {
      const { data } = await supabase.from('humor_flavors').select('*').order('slug')
      if (data) setFlavors(data)
    }
    fetchFlavors()
  }, [supabase])

  useEffect(() => {
    if (!selectedFlavorId) return
    const fetchSteps = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('humor_flavor_steps')
        .select('*')
        .eq('humor_flavor_id', selectedFlavorId)
        .order('order_by')
      if (data) setSteps(data)
      setLoading(false)
    }
    fetchSteps()
  }, [selectedFlavorId, supabase])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over?.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        // Update order_by locally
        return newItems.map((item, idx) => ({ ...item, order_by: idx + 1 }))
      })
    }
  }

  const saveOrder = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    for (const update of steps) {
      await supabase
        .from('humor_flavor_steps')
        .update({ 
          order_by: update.order_by, 
          modified_by_user_id: user?.id,
          modified_datetime_utc: new Date().toISOString() 
        })
        .eq('id', update.id)
    }
    
    setSaving(false)
    alert('Order saved successfully!')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
           <Sparkles className="w-32 h-32 text-foreground" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <label className="text-xs font-black text-foreground/40 uppercase tracking-[0.2em]">Select Flavor</label>
              <select
                value={selectedFlavorId}
                onChange={(e) => setSelectedFlavorId(e.target.value)}
                className="w-full md:w-64 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="">Select a flavor...</option>
                {flavors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.slug} - {f.description}
                  </option>
                ))}
              </select>
            </div>

            {steps.length > 0 && (
              <button
                onClick={saveOrder}
                disabled={saving}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Order
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
              <p className="text-slate-500 font-medium">Fetching steps...</p>
            </div>
          ) : steps.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={steps} strategy={verticalListSortingStrategy}>
                <div className="max-w-2xl mx-auto">
                  {steps.map((step) => (
                    <SortableItem key={step.id} step={step} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : selectedFlavorId && (
            <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-3xl p-12 text-center">
              <p className="text-slate-500 font-medium">No steps found for this flavor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
