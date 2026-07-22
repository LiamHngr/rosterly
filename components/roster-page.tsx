'use client'

import { useCallback, useEffect, useState } from 'react'
import { addWeeks, startOfWeek } from 'date-fns'
import { WeekNav } from './week-nav'
import { RosterGrid } from './roster-grid'
import { Users } from 'lucide-react'

const STORAGE_KEY = 'team-roster-v1'

type Roster = Record<string, string[]>

function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // Monday
}

function loadRoster(): Roster {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveRoster(roster: Roster): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roster))
  } catch {
    // localStorage not available
  }
}

export function RosterPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()))
  const [roster, setRoster] = useState<Roster>({})
  const [mounted, setMounted] = useState(false)
  const [globalName, setGlobalName] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    setRoster(loadRoster())
    setMounted(true)
  }, [])

  // Persist on every roster change
  useEffect(() => {
    if (mounted) saveRoster(roster)
  }, [roster, mounted])

  const navigate = useCallback((dir: -1 | 1) => {
    setWeekStart((prev) => getWeekStart(addWeeks(prev, dir)))
  }, [])

  const goToToday = useCallback(() => {
    setWeekStart(getWeekStart(new Date()))
  }, [])

  const handleAddName = useCallback((dateKey: string, name: string) => {
    setRoster((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] ?? []), name],
    }))
  }, [])

  const handleRemoveName = useCallback((dateKey: string, index: number) => {
    setRoster((prev) => {
      const updated = [...(prev[dateKey] ?? [])]
      updated.splice(index, 1)
      return { ...prev, [dateKey]: updated }
    })
  }, [])

  const totalThisWeek = Array.from({ length: 7 }).reduce<number>((acc, _, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    return acc + (roster[key]?.length ?? 0)
  }, 0)

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading roster…</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Users size={18} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">The Control Room Roster</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          Enter your name below, then click <strong className="text-foreground font-medium">Add me</strong> on any day to sign up.
          {totalThisWeek > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {totalThisWeek} {totalThisWeek === 1 ? 'entry' : 'entries'} this week
            </span>
          )}
        </p>

        {/* Global name input */}
        <div className="mt-4 ml-11 flex items-center gap-2 max-w-sm">
          <label htmlFor="global-name" className="sr-only">Your name</label>
          <input
            id="global-name"
            type="text"
            value={globalName}
            onChange={(e) => setGlobalName(e.target.value)}
            placeholder="Enter your name…"
            maxLength={40}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {globalName.trim() && (
            <span className="text-xs text-muted-foreground font-medium px-2 py-1.5 rounded-lg bg-secondary">
              Ready to add
            </span>
          )}
        </div>
      </header>

      {/* Week navigation */}
      <div className="mb-5">
        <WeekNav
          weekStart={weekStart}
          onNavigate={navigate}
          onGoToToday={goToToday}
        />
      </div>

      {/* Roster grid */}
      <RosterGrid
        weekStart={weekStart}
        roster={roster}
        globalName={globalName.trim()}
        onAddName={handleAddName}
        onRemoveName={handleRemoveName}
      />

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        Roster data is saved in your browser. Everyone on the same device shares the same view.
      </footer>
    </main>
  )
}
