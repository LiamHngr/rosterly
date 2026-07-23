"use client"

import { useState, useEffect, useCallback } from "react"

const DAY_NAMES  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
const SHORT_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
const MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function pad(n: number) { return String(n).padStart(2, "0") }

function fmtKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}

function getMondayOf(d: Date): Date {
  const date = new Date(d)
  const day  = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0,0,0,0)
  return date
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function isToday(d: Date): boolean {
  const t = new Date()
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

function isPast(d: Date): boolean {
  const today = new Date(); today.setHours(0,0,0,0)
  return d < today
}

function fmtDisplay(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function storageKey(monday: Date): string {
  return "controlroom_roster_" + fmtKey(monday)
}

type RosterData = Record<string, string[]>

function loadFromStorage(monday: Date): RosterData {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(storageKey(monday)) ?? "{}") as RosterData
  } catch { return {} }
}

function saveToStorage(monday: Date, data: RosterData) {
  if (typeof window === "undefined") return
  localStorage.setItem(storageKey(monday), JSON.stringify(data))
}

export default function Roster() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOf(new Date()))
  const [roster, setRoster]               = useState<RosterData>({})
  const [nameInput, setNameInput]         = useState("")
  const [toast, setToast]                 = useState<{ msg: string; visible: boolean }>({ msg: "", visible: false })
  const [toastTimer, setToastTimer]       = useState<ReturnType<typeof setTimeout> | null>(null)

  // Load roster for current week
  useEffect(() => {
    setRoster(loadFromStorage(currentMonday))
  }, [currentMonday])

  const showToast = useCallback((msg: string) => {
    if (toastTimer) clearTimeout(toastTimer)
    setToast({ msg, visible: true })
    const t = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500)
    setToastTimer(t)
  }, [toastTimer])

  const addName = (dayKey: string, dayLabel: string) => {
    const name = nameInput.trim()
    if (!name) {
      document.getElementById("nameInput")?.focus()
      showToast("Please enter a name first!")
      return
    }
    const updated = { ...roster }
    if (!updated[dayKey]) updated[dayKey] = []
    if (updated[dayKey].map(n => n.toLowerCase()).includes(name.toLowerCase())) {
      showToast(`${name} is already on ${dayLabel}!`)
      return
    }
    updated[dayKey] = [...updated[dayKey], name]
    setRoster(updated)
    saveToStorage(currentMonday, updated)
    showToast(`${name} added to ${dayLabel}`)
  }

  const removeName = (dayKey: string, idx: number) => {
    const updated = { ...roster }
    if (!updated[dayKey]) return
    const removed = updated[dayKey][idx]
    updated[dayKey] = updated[dayKey].filter((_, i) => i !== idx)
    setRoster(updated)
    saveToStorage(currentMonday, updated)
    showToast(`${removed} removed`)
  }

  const getWeekTitle = (): string => {
    const today = getMondayOf(new Date())
    const diff  = Math.round((currentMonday.getTime() - today.getTime()) / (7 * 86400000))
    if (diff === 0)  return "This Week"
    if (diff === 1)  return "Next Week"
    if (diff === -1) return "Last Week"
    if (diff > 1)   return `${diff} Weeks Ahead`
    return `${Math.abs(diff)} Weeks Ago`
  }

  const sunday = addDays(currentMonday, 6)

  return (
    <>
      {/* ── Header ── */}
      <header className="header-sticky">
        <div className="header-top">
          <div className="site-title">
            <span className="live-dot" aria-hidden="true" />
            The Control Room Roster
          </div>
          <nav className="week-nav" aria-label="Week navigation">
            <button
              className="nav-btn"
              onClick={() => setCurrentMonday(d => addDays(d, -7))}
              aria-label="Previous week"
              title="Previous week"
            >←</button>
            <div className="week-label" aria-live="polite">
              <span className="week-title">{getWeekTitle()}</span>
              <span className="week-range">{fmtDisplay(currentMonday)} – {fmtDisplay(sunday)}</span>
            </div>
            <button
              className="nav-btn"
              onClick={() => setCurrentMonday(d => addDays(d, 7))}
              aria-label="Next week"
              title="Next week"
            >→</button>
            <button
              className="today-btn"
              onClick={() => setCurrentMonday(getMondayOf(new Date()))}
            >Today</button>
          </nav>
        </div>

        <div className="name-row">
          <span className="name-label">Add Name</span>
          <input
            id="nameInput"
            type="text"
            className="name-input"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                // Add to first available (non-past) day
                for (let i = 0; i < 7; i++) {
                  const day = addDays(currentMonday, i)
                  if (!isPast(day)) { addName(fmtKey(day), DAY_NAMES[i]); break }
                }
              }
            }}
            placeholder="Enter your name…"
            maxLength={40}
            autoComplete="off"
            aria-label="Enter your name to add to the roster"
          />
          <button
            className="clear-btn"
            onClick={() => { setNameInput(""); document.getElementById("nameInput")?.focus() }}
          >Clear</button>
        </div>
      </header>

      {/* ── Roster Grid ── */}
      <main className="main-content">
        <div className="days-grid" role="list" aria-label="Weekly roster">
          {Array.from({ length: 7 }).map((_, i) => {
            const day   = addDays(currentMonday, i)
            const key   = fmtKey(day)
            const names = roster[key] ?? []
            const past  = isPast(day)
            const today = isToday(day)

            return (
              <article
                key={key}
                className={`day-card${today ? " today" : ""}${past ? " past" : ""}`}
                role="listitem"
                aria-label={`${DAY_NAMES[i]}, ${fmtDisplay(day)}`}
              >
                {/* Day header */}
                <div className="day-header">
                  <div>
                    <div className="day-name">{SHORT_DAYS[i]}</div>
                    <div className="day-date">{day.getDate()}</div>
                  </div>
                  {today && <span className="today-badge">Today</span>}
                  {past  && <span className="past-badge">Past</span>}
                </div>

                {/* Name list */}
                <ul className="roster-list" aria-label={`Names for ${DAY_NAMES[i]}`}>
                  {names.length === 0 ? (
                    <li className="empty-label">No one yet</li>
                  ) : (
                    names.map((name, idx) => (
                      <li key={idx} className="roster-item">
                        <span className="roster-name">{name}</span>
                        {!past && (
                          <button
                            className="remove-btn"
                            onClick={() => removeName(key, idx)}
                            aria-label={`Remove ${name}`}
                            title={`Remove ${name}`}
                          >×</button>
                        )}
                      </li>
                    ))
                  )}
                </ul>

                {/* Add button */}
                {!past && (
                  <button
                    className="add-day-btn"
                    onClick={() => addName(key, DAY_NAMES[i])}
                    aria-label={`Add name to ${DAY_NAMES[i]}`}
                  >+ Add to {SHORT_DAYS[i]}</button>
                )}
              </article>
            )
          })}
        </div>

        <footer className="site-footer">
          <p>Names are stored locally in your browser · The Control Room Roster</p>
        </footer>
      </main>

      {/* ── Toast ── */}
      <div
        className={`toast${toast.visible ? " show" : ""}`}
        role="status"
        aria-live="polite"
      >{toast.msg}</div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* Reset */
        *, *::before, *::after { box-sizing: border-box; }

        /* Design tokens */
        :root {
          --cr-bg:           #0f1117;
          --cr-surface:      #1a1d27;
          --cr-surface2:     #22273a;
          --cr-border:       #2e3347;
          --cr-accent:       #3b82f6;
          --cr-accent-dim:   #1d4ed8;
          --cr-muted:        #3a3f55;
          --cr-text:         #e2e8f0;
          --cr-text-muted:   #6b7280;
          --cr-today-bg:     #1e3a5f;
          --cr-today-ring:   #3b82f6;
          --cr-past-bg:      #12141c;
          --cr-past-text:    #3a3f55;
          --cr-danger:       #ef4444;
          --cr-radius:       10px;
          --cr-font:         'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        body {
          background: var(--cr-bg);
          color: var(--cr-text);
          font-family: var(--cr-font);
          min-height: 100vh;
        }

        /* ── Header ── */
        .header-sticky {
          background: var(--cr-surface);
          border-bottom: 1px solid var(--cr-border);
          padding: 20px 24px 16px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 24px rgba(0,0,0,0.45);
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 14px;
        }

        .site-title {
          font-size: clamp(1rem, 3vw, 1.55rem);
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--cr-text);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .live-dot {
          display: inline-block;
          width: 10px; height: 10px;
          background: var(--cr-accent);
          border-radius: 50%;
          animation: livePulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }

        /* ── Name row ── */
        .name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .name-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--cr-text-muted);
          white-space: nowrap;
        }

        .name-input {
          flex: 1;
          min-width: 180px;
          max-width: 300px;
          background: var(--cr-bg);
          border: 1px solid var(--cr-border);
          border-radius: 7px;
          color: var(--cr-text);
          font-family: var(--cr-font);
          font-size: 0.95rem;
          padding: 8px 12px;
          outline: none;
          transition: border-color 0.2s;
        }
        .name-input::placeholder { color: var(--cr-text-muted); }
        .name-input:focus { border-color: var(--cr-accent); box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }

        .clear-btn {
          background: transparent;
          border: 1px solid var(--cr-border);
          color: var(--cr-text-muted);
          border-radius: 7px;
          padding: 8px 14px;
          font-size: 0.85rem;
          font-family: var(--cr-font);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .clear-btn:hover { background: var(--cr-surface2); color: var(--cr-text); }

        /* ── Week nav ── */
        .week-nav {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .nav-btn {
          background: var(--cr-surface2);
          border: 1px solid var(--cr-border);
          color: var(--cr-text);
          border-radius: 7px;
          width: 34px; height: 34px;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .nav-btn:hover { background: var(--cr-muted); border-color: var(--cr-accent); }

        .week-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 170px;
          text-align: center;
          gap: 2px;
        }

        .week-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--cr-text);
          line-height: 1.2;
        }

        .week-range {
          font-size: 0.74rem;
          color: var(--cr-text-muted);
          font-weight: 400;
        }

        .today-btn {
          background: transparent;
          border: 1px solid var(--cr-accent);
          color: var(--cr-accent);
          border-radius: 7px;
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 700;
          font-family: var(--cr-font);
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .today-btn:hover { background: rgba(59,130,246,0.15); }

        /* ── Main ── */
        .main-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 16px 60px;
        }

        /* ── Grid ── */
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
        }
        @media (max-width: 900px) { .days-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 580px) { .days-grid { grid-template-columns: repeat(2, 1fr); } }

        /* ── Day card ── */
        .day-card {
          background: var(--cr-surface);
          border: 1px solid var(--cr-border);
          border-radius: var(--cr-radius);
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 180px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .day-card:not(.past):not(.today):hover {
          border-color: var(--cr-muted);
        }

        .day-card.today {
          background: var(--cr-today-bg);
          border-color: var(--cr-today-ring);
          box-shadow: 0 0 0 1px var(--cr-today-ring), 0 4px 20px rgba(59,130,246,0.2);
        }

        .day-card.past {
          background: var(--cr-past-bg);
          border-color: var(--cr-border);
          opacity: 0.55;
        }

        /* Day card header */
        .day-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 4px;
        }

        .day-name {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--cr-text-muted);
          line-height: 1;
          margin-bottom: 4px;
        }

        .day-date {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--cr-text);
          line-height: 1;
        }

        .today .day-name { color: var(--cr-accent); }
        .today .day-date { color: #ffffff; }
        .past  .day-date { color: var(--cr-past-text); }

        .today-badge, .past-badge {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-radius: 4px;
          padding: 2px 6px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .today-badge { background: var(--cr-accent); color: #fff; }
        .past-badge  { background: var(--cr-muted); color: var(--cr-text-muted); }

        /* ── Roster list ── */
        .roster-list {
          list-style: none;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin: 0;
          padding: 0;
        }

        .roster-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--cr-surface2);
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 0.84rem;
          color: var(--cr-text);
          gap: 6px;
          animation: fadeSlide 0.18s ease;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .past .roster-item {
          background: var(--cr-surface);
          color: var(--cr-past-text);
        }

        .roster-name { flex: 1; word-break: break-word; }

        .remove-btn {
          background: transparent;
          border: none;
          color: var(--cr-text-muted);
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0 2px;
          border-radius: 3px;
          transition: color 0.15s;
          flex-shrink: 0;
        }
        .remove-btn:hover { color: var(--cr-danger); }

        .empty-label {
          font-size: 0.76rem;
          color: var(--cr-muted);
          font-style: italic;
          text-align: center;
          padding: 6px 0;
          list-style: none;
        }

        /* ── Add button ── */
        .add-day-btn {
          background: var(--cr-accent);
          border: none;
          border-radius: 7px;
          color: #fff;
          font-family: var(--cr-font);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 8px 10px;
          cursor: pointer;
          width: 100%;
          letter-spacing: 0.03em;
          transition: background 0.15s, transform 0.1s;
          margin-top: auto;
        }
        .add-day-btn:hover { background: var(--cr-accent-dim); }
        .add-day-btn:active { transform: scale(0.97); }

        /* ── Footer ── */
        .site-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 0.76rem;
          color: var(--cr-muted);
        }

        /* ── Toast ── */
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: var(--cr-surface);
          border: 1px solid var(--cr-accent);
          border-radius: 8px;
          color: var(--cr-text);
          font-family: var(--cr-font);
          font-size: 0.87rem;
          padding: 10px 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
          z-index: 9999;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.25s, transform 0.25s;
          pointer-events: none;
          max-width: 280px;
        }
        .toast.show { opacity: 1; transform: translateY(0); }
      `}</style>
    </>
  )
}
