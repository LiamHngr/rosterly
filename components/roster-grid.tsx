'use client'

import { addDays } from 'date-fns'
import { DayCard } from './day-card'

interface RosterGridProps {
  weekStart: Date
  roster: Record<string, string[]>
  globalName: string
  onAddName: (dateKey: string, name: string) => void
  onRemoveName: (dateKey: string, index: number) => void
}

function dateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function RosterGrid({ weekStart, roster, globalName, onAddName, onRemoveName }: RosterGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((day) => {
        const key = dateKey(day)
        return (
          <DayCard
            key={key}
            date={day}
            names={roster[key] ?? []}
            globalName={globalName}
            onAddName={(name) => onAddName(key, name)}
            onRemoveName={(i) => onRemoveName(key, i)}
          />
        )
      })}
    </div>
  )
}
