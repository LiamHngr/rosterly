'use client'

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { addWeeks, format, isSameWeek, startOfWeek } from 'date-fns'

interface WeekNavProps {
  weekStart: Date
  onNavigate: (dir: -1 | 1) => void
  onGoToToday: () => void
}

export function WeekNav({ weekStart, onNavigate, onGoToToday }: WeekNavProps) {
  const weekEnd = addWeeks(weekStart, 1)
  weekEnd.setDate(weekEnd.getDate() - 1)

  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 })

  const label = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate(-1)}
          aria-label="Previous week"
          className="p-2 rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-base font-semibold text-foreground min-w-[200px] text-center">
          {label}
        </div>

        <button
          onClick={() => onNavigate(1)}
          aria-label="Next week"
          className="p-2 rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {!isCurrentWeek && (
        <button
          onClick={onGoToToday}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-card hover:bg-secondary text-foreground transition-colors"
        >
          <CalendarDays size={15} />
          This week
        </button>
      )}

      {isCurrentWeek && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent/15 text-accent-foreground border border-accent/30"
          style={{ color: 'var(--color-today-foreground)', background: 'var(--color-today)' }}
        >
          <CalendarDays size={15} />
          Current week
        </span>
      )}
    </div>
  )
}
