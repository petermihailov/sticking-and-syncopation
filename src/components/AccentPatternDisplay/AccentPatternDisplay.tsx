interface AccentPatternDisplayProps {
  accents: number[]
  className?: string
  compact?: boolean
}

export function AccentPatternDisplay({
  accents,
  className,
  compact = false,
}: AccentPatternDisplayProps) {
  const displayAccents = compact
    ? accents.filter((_, i) => i % 2 === 0) // берём индексы 0,2,4,6
    : accents

  return (
    <span className={className}>
      {displayAccents.map(a => (a === 1 ? '●' : '○')).join(' ')}
    </span>
  )
}
