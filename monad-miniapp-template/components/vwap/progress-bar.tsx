'use client'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  className?: string
}

export function ProgressBar({ value, max, label, className = '' }: ProgressBarProps) {
  const v = Number.isFinite(value) ? value : 0
  const m = Number.isFinite(max) && max >= 0 ? max : 0
  const pct = m > 0 ? Math.min(100, (v / m) * 100) : 0
  return (
    <div className={`w-full ${className}`}>
      {(label ?? v !== m) && (
        <div className="mb-1 flex justify-between text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          <span className="text-muted-foreground">
            {v} / {m}
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
