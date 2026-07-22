'use client'

import { useState } from 'react'
import { format, isToday, isPast, startOfDay } from 'date-fns'
import { Plus, X, UserRound } from 'lucide-react'

interface DayCardProps {
  date: Date
  names: string[]
  onAddName: (name: string) => void
  onRemoveName: (index: number) => void
}

export function DayCard({ date, names, onAddName, onRemoveName }: DayCardProps) {
  const [inputValue, setInputValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const today = isToday(date)
  const past = isPast(startOfDay(date)) && !today

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onAddName(trimmed)
    setInputValue('')
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setInputValue('')
      setIsAdding(false)
    }
  }

  return (
    <div
      className={`
        flex flex-col rounded-xl border p-4 gap-3 transition-all
        ${today
          ? 'border-[var(--color-today-foreground)]/30 bg-today shadow-sm ring-1 ring-[var(--color-today-foreground)]/20'
          : past
          ? 'border-border bg-card opacity-70'
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
      </div>

      {/* Names list */}
      <div className="flex flex-col gap-1.5 min-h-[40px]">
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
            <span className="flex items-center gap-1.5">
              <UserRound size={13} className="shrink-0 opacity-60" />
              {name}
            </span>
            <button
              onClick={() => onRemoveName(i)}
              aria-label={`Remove ${name}`}
              className={`
                opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5
                hover:bg-red-500/20 hover:text-red-500
              `}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add name */}
      {isAdding ? (
        <div className="flex gap-1.5">
          <input
            autoFocus
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your name…"
            maxLength={40}
            className={`
              flex-1 text-sm px-2.5 py-1.5 rounded-lg border outline-none min-w-0
              ${today
                ? 'bg-[var(--color-today-foreground)]/10 border-[var(--color-today-foreground)]/30 text-[var(--color-today-foreground)] placeholder:text-[var(--color-today-foreground)]/40 focus:border-[var(--color-today-foreground)]/60'
                : 'bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary'
              }
            `}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            aria-label="Add name"
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Add
          </button>
          <button
            onClick={() => { setIsAdding(false); setInputValue('') }}
            aria-label="Cancel"
            className={`px-2.5 py-1.5 rounded-lg text-sm border transition-colors ${today ? 'border-[var(--color-today-foreground)]/30 text-[var(--color-today-foreground)]/70 hover:bg-[var(--color-today-foreground)]/10' : 'border-border text-muted-foreground hover:bg-secondary'}`}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className={`
            flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-dashed transition-colors w-full
            ${today
              ? 'border-[var(--color-today-foreground)]/30 text-[var(--color-today-foreground)]/70 hover:bg-[var(--color-today-foreground)]/10 hover:border-[var(--color-today-foreground)]/50'
              : 'border-border text-muted-foreground hover:bg-secondary hover:border-primary/40 hover:text-foreground'
            }
          `}
        >
          <Plus size={13} />
          Add name
        </button>
      )}
    </div>
  )
}
