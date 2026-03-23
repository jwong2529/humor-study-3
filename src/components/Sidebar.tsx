'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Image as ImageIcon, MessageSquare, 
  Sparkles, ListTree, Blend, Quote, HelpCircle, 
  Cpu, Database, Link as LinkIcon, Reply, 
  Globe, Mail, FileText
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { group: 'Prompt Chain Tool', items: [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Humor Lab', href: '/prompt-chain-tool', icon: LinkIcon },
    { name: 'Captions Registry', href: '/captions', icon: FileText },
  ]},
  { group: 'Configuration', items: [
    { name: 'Humor Flavors', href: '/humor-flavors', icon: Sparkles },
    { name: 'Flavor Steps', href: '/flavor-steps', icon: ListTree },
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()

  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/login' || pathname === '/unauthorized'
  
  if (isAuthPage) return null

  return (
    <aside className="w-64 bg-[#1e293b] border-r border-slate-700/50 flex flex-col fixed inset-y-0 z-50 overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Flavor Factory</h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Project 03</p>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 px-4 pb-8 space-y-8">
        {navItems.map((group) => (
          <div key={group.group}>
            <h2 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              {group.group}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-blue-600/10 text-blue-400" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500")} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
