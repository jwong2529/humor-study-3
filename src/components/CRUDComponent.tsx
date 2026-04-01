'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Pencil, Trash2, Save, X, Loader2, ChevronRight } from 'lucide-react'
import { tableSchemas } from '@/config/schemas'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CRUDProps {
  tableKey: keyof typeof tableSchemas
}

export default function CRUDComponent({ tableKey }: CRUDProps) {
  const schema = tableSchemas[tableKey]
  const [data, setData] = useState<any[]>([])
  const [lookups, setLookups] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [mounted, setMounted] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from(tableKey as string)
      .select('*')
      .order('created_datetime_utc', { ascending: false })
      .limit(100)

    if (error) {
       const { data: fallbackData } = await supabase
         .from(tableKey as string)
         .select('*')
         .limit(100)
       setData(fallbackData || [])
    } else {
      setData(data || [])
    }

    // Fetch lookups
    const lookupTables = schema.columns
      .filter(c => c.lookup)
      .map(c => c.lookup!.table)
    
    const uniqueTables = Array.from(new Set(lookupTables))
    const lookupMap: Record<string, any[]> = {}
    
    for (const table of uniqueTables) {
      const { data: lookupData } = await supabase.from(table).select('*')
      if (lookupData) lookupMap[table] = lookupData
    }
    setLookups(lookupMap)
    
    setLoading(false)
  }, [tableKey, supabase, schema.columns])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const startEdit = (item: any) => {
    setEditingId(item.id)
    setFormData(item)
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    // Set some smart defaults for flavor steps
    const defaults: any = {}
    if (tableKey === 'humor_flavor_steps') {
      defaults.llm_model_id = 16
      defaults.llm_input_type_id = 2
      defaults.llm_output_type_id = 2
      defaults.humor_flavor_step_type_id = 3
      defaults.llm_temperature = 0.7
    }
    setFormData(defaults)
  }

  const cancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({})
  }

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('You must be logged in.')
      return
    }

    const payload = { ...formData }
    payload.modified_by_user_id = session.user.id
    if (!editingId) payload.created_by_user_id = session.user.id

    const { error } = editingId 
      ? await supabase.from(tableKey as string).update(payload).eq('id', editingId)
      : await supabase.from(tableKey as string).insert([payload])

    if (error) alert(error.message)
    else { cancel(); fetchData(); }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    await supabase.from(tableKey as string).delete().eq('id', id)
    fetchData()
  }

  const getLookupLabel = (col: any, value: any) => {
    if (!col.lookup || !lookups[col.lookup.table]) return value
    const item = lookups[col.lookup.table].find(i => i[col.lookup.keyField].toString() === value?.toString())
    return item ? item[col.lookup.labelField] : value
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight">{schema.name}</h2>
          <p className="text-sm text-foreground/50 font-medium">Manage your {schema.name.toLowerCase()} records</p>
        </div>
        {!schema.readOnly && !isAdding && (
          <button 
            onClick={startAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        )}
      </header>

      {(isAdding || editingId) && (
        <div className="bg-card border border-border rounded-[2rem] p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             {isAdding ? <Plus className="w-24 h-24" /> : <Pencil className="w-24 h-24" />}
          </div>
          
          <h3 className="text-xl font-black text-foreground flex items-center gap-3 uppercase italic">
            <div className="p-2 bg-blue-500/10 rounded-lg">
               {isAdding ? <Plus className="w-5 h-5 text-blue-400" /> : <Pencil className="w-5 h-5 text-blue-400" />}
            </div>
            {isAdding ? 'Add New Record' : 'Edit Record'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {schema.columns.filter(c => !c.hideInForm).map(col => (
              <div key={col.key} className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">{col.label}</label>
                
                {col.type === 'select' && col.lookup ? (
                  <select
                    value={formData[col.key] || ''}
                    onChange={(e) => handleInputChange(col.key, col.key.includes('_id') ? e.target.value : Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-blue-500 outline-none appearance-none cursor-pointer font-bold"
                  >
                    <option value="">Select {col.label}...</option>
                    {lookups[col.lookup.table]?.map(item => (
                      <option key={item[col.lookup!.keyField]} value={item[col.lookup!.keyField]}>
                        {item[col.lookup!.labelField]}
                      </option>
                    ))}
                  </select>
                ) : col.type === 'textarea' ? (
                  <textarea 
                    value={formData[col.key] || ''}
                    onChange={(e) => handleInputChange(col.key, e.target.value)}
                    placeholder={`Enter ${col.label.toLowerCase()}...`}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-blue-500 outline-none min-h-[120px] font-medium placeholder:text-foreground/20"
                  />
                ) : col.type === 'boolean' ? (
                  <div className="flex items-center h-12">
                    <input 
                      type="checkbox"
                      checked={!!formData[col.key]}
                      onChange={(e) => handleInputChange(col.key, e.target.checked)}
                      className="w-6 h-6 bg-background border-border rounded-lg checked:bg-blue-600 transition-all cursor-pointer"
                    />
                  </div>
                ) : (
                  <input 
                    type={col.type === 'number' ? 'number' : 'text'}
                    value={formData[col.key] || ''}
                    placeholder={`Enter ${col.label.toLowerCase()}...`}
                    onChange={(e) => handleInputChange(col.key, col.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-blue-500 outline-none font-bold placeholder:text-foreground/20"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4 border-t border-border/50">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button 
              onClick={cancel}
              className="flex items-center gap-2 bg-foreground/10 hover:bg-foreground/20 text-foreground px-8 py-3 rounded-2xl font-black transition-all uppercase text-xs tracking-widest"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl relative">
        {/* SCROLL INDICATOR GRADIENT */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent pointer-events-none z-10 opacity-50 block md:hidden lg:block lg:opacity-30" />
        
        <div className="overflow-x-auto custom-scrollbar-h relative rounded-[2.5rem]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-foreground/5 border-b border-border">
                {schema.columns.map(col => (
                  <th key={col.key} className="p-6 text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] whitespace-nowrap">{col.label}</th>
                ))}
                {!schema.readOnly && (
                  <th className="p-6 text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] sticky right-0 bg-card/90 backdrop-blur-md z-20 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.3)]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading && !data.length ? (
                <tr>
                  <td colSpan={schema.columns.length + (schema.readOnly ? 0 : 1)} className="p-20 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
                    <p className="text-foreground/40 font-black uppercase tracking-widest text-xs">Accessing Archives...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={schema.columns.length + (schema.readOnly ? 0 : 1)} className="p-20 text-center text-foreground/30 font-bold italic">
                    No records found in this sector.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-foreground/5 transition-colors group">
                    {schema.columns.map(col => (
                      <td key={col.key} className="p-6 text-sm">
                        {col.type === 'boolean' ? (
                          item[col.key] ? (
                            <span className="bg-green-500/10 text-green-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic border border-green-500/20">Active</span>
                          ) : (
                            <span className="bg-foreground/5 text-foreground/30 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic border border-border">Inactive</span>
                          )
                        ) : col.type === 'date' ? (
                          <span className="text-[11px] font-bold text-foreground/40 uppercase tabular-nums">{mounted && item[col.key] ? new Date(item[col.key]).toLocaleDateString() : 'N/A'}</span>
                        ) : (
                          <div className={cn(
                            "max-w-[250px] truncate font-medium", 
                            col.mono && "font-mono text-[11px] text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10",
                            col.type === 'select' && "text-blue-200 font-bold italic"
                          )}>
                            {col.type === 'select' ? getLookupLabel(col, item[col.key]) : (item[col.key]?.toString() || '-')}
                          </div>
                        )}
                      </td>
                    ))}
                    {!schema.readOnly && (
                      <td className="p-6 flex gap-3 sticky right-0 bg-card/90 backdrop-blur-md z-20 group-hover:bg-foreground/5 transition-colors shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.3)]">
                        <button 
                          onClick={() => startEdit(item)}
                          className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <style jsx global>{`
          .custom-scrollbar-h::-webkit-scrollbar {
            height: 10px;
          }
          .custom-scrollbar-h::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.4);
            border-radius: 20px;
            margin: 0 40px;
          }
          .custom-scrollbar-h::-webkit-scrollbar-thumb {
            background: linear-gradient(to right, #3b82f6, #6366f1);
            border-radius: 20px;
            border: 2px solid rgba(15, 23, 42, 0.5);
          }
          .custom-scrollbar-h::-webkit-scrollbar-thumb:hover {
            background: #60a5fa;
          }
        `}</style>
      </div>
    </div>
  )
}
