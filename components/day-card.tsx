'use client'

import { format, isToday, isPast, startOfDay } from 'date-fns'
import { Plus, X, UserRound, Lock } from 'lucide-react'

interface DayCardProps {
  date: Date
  names: string[]
  globalName: string
  onAddName: (name: string) => void
  onRemoveName: (index: number) => void
}

export function DayCard({ date, names, globalName, onAddName, onRemoveName }: DayCardProps) {
  const today = isToday(date)
  const past = isPast(startOfDay(date)) && !today
  const locked = past

  const handleAdd = () => {
    if (!globalName || locked) return
    onAddName(globalName)
  }

  return (
    <div
      className={`
        flex flex-col rounded-xl border p-4 gap-3 transition-all
        ${today
          ? 'border-[var(--color-today-foreground)]/30 bg-today shadow-sm ring-1 ring-[var(--color-today-foreground)]/20'
          : locked
          ? 'border-border bg-card opacity-55'
          : 'border-border bg-card hover:shadow-sm'
        }
      `}
      style={today ? { background: 'var(--color-today)', color: 'var(--color-today-foreground)' } : {}}
    >
      {/* Day header */}
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider ${today ? 'text-[var(--color-today-foreground)]/70' : 'text-muted-foreground'}`}>
            {format(date, 'EEEE')}
          </div>
          <div className={`text-2xl font-bold leading-tight ${today ? 'text-[var(--color-today-foreground)]' : 'text-foreground'}`}>
            {format(date, 'd')}
          </div>
          <div className={`text-xs ${today ? 'text-[var(--color-today-foreground)]/60' : 'text-muted-foreground'}`}>
            {format(date, 'MMM yyyy')}
          </div>
        </div>
        {today && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--color-today-foreground)]/15 text-[var(--color-today-foreground)]">
            Today
          </span>
        )}
        {locked && (
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            <Lock size={9} />
            Past
          </span>
        )}
      </div>

      {/* Names list */}
      <div className="flex flex-col gap-1.5 min-h-[40px] flex-1">
        {names.length === 0 && (
          <p className={`text-xs italic ${today ? 'text-[var(--color-today-foreground)]/50' : 'text-muted-foreground'}`}>
            No one signed up yet
          </p>
        )}
        {names.map((name, i) => (
          <div
            key={i}
            className={`
              flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 group text-sm font-medium
              ${today
                ? 'bg-[var(--color-today-foreground)]/10 text-[var(--color-today-foreground)]'
                : 'bg-secondary text-secondary-foreground'
              }
            `}
          >
            <span className="flex items-center gap-1.5 truncate">
              <UserRound size={13} className="shrink-0 opacity-60" />
              <span className="truncate">{name}</span>
            </span>
            {!locked && (
              <button
                onClick={() => onRemoveName(i)}
                aria-label={`Remove ${name}`}
                className={`
                  opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 shrink-0
                  hover:bg-red-500/20 hover:text-red-500
                `}
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add me button — hidden for past days */}
      {!locked && (
        <button
          onClick={handleAdd}
          disabled={!globalName}
          aria-label={globalName ? `Add ${globalName} to ${format(date, 'EEEE')}` : 'Enter your name above first'}
          title={!globalName ? 'Enter your name at the top first' : undefined}
          className={`
            flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-2 border border-dashed transition-colors w-full
            ${today
              ? 'border-[var(--color-today-foreground)]/30 text-[var(--color-today-foreground)]/70 hover:bg-[var(--color-today-foreground)]/10 hover:border-[var(--color-today-foreground)]/50 disabled:opacity-40 disabled:cursor-not-allowed'
              : 'border-border text-muted-foreground hover:bg-secondary hover:border-primary/40 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed'
            }
          `}
        >
          <Plus size={13} />
          {globalName ? `Add me` : 'Add me'}
        </button>
      )}
    </div>
  )
}
