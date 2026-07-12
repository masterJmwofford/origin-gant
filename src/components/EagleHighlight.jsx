import { getEagleHighlightMatches } from '../utils/eagleHighlightScoring'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default function EagleHighlight({ text, enabled, compareWith = [] }) {
  if (!enabled || typeof text !== 'string') return text

  const matches = getEagleHighlightMatches(text, undefined, compareWith).slice(0, 1)

  if (matches.length === 0) return text

  const pattern = new RegExp(`(${matches.map(escapeRegExp).join('|')})`, 'gi')

  return text.split(pattern).map((part, index) => {
    const isMatch = matches.some((phrase) => phrase.toLowerCase() === part.toLowerCase())

    if (!isMatch) return part

    return (
      <mark className="eagle-highlight" key={`${part}-${index}`}>
        {part}
      </mark>
    )
  })
}
