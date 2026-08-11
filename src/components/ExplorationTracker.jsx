import { useEffect, useRef } from 'react'

const explorationSelector = [
  '.tab-panel .study-section',
  '.tab-panel article',
  '.tab-panel .card',
  '.tab-panel .accordion-item',
  '.tab-panel .flashcard',
  '.tab-panel .question-panel',
  '.tab-panel .roadmap-detail',
  '.tab-panel .coverage-plan-card',
  '.tab-panel .shipping-policy-card',
  '.tab-panel .shipping-estimate-grid > *',
].join(',')

function itemKey(element, index) {
  const explicit = element.dataset.progressKey || element.id
  if (explicit) return explicit.toLowerCase().replace(/[^a-z0-9:_-]+/g, '-').slice(0, 90)
  const type = [...element.classList][0] || element.tagName.toLowerCase()
  return `${type.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}:${index}`
}

export default function ExplorationTracker({ section, onExplore, children }) {
  const trackerRef = useRef(null)
  const viewedRef = useRef(new Set())
  const actedRef = useRef(new Set())

  useEffect(() => {
    const root = trackerRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return undefined
    const keys = new Map()
    const observed = new Set()
    const timers = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = keys.get(entry.target)
          const hasMeaningfulVisibility =
            entry.intersectionRatio >= 0.45 ||
            entry.intersectionRect.height >= Math.min(240, entry.boundingClientRect.height * 0.35)
          if (
            entry.isIntersecting &&
            hasMeaningfulVisibility &&
            !viewedRef.current.has(`${section}:${key}`) &&
            !timers.has(entry.target)
          ) {
            const timer = window.setTimeout(() => {
              viewedRef.current.add(`${section}:${key}`)
              onExplore(section, key, 'view')
              timers.delete(entry.target)
              observer.unobserve(entry.target)
            }, 650)
            timers.set(entry.target, timer)
          } else if (timers.has(entry.target)) {
            window.clearTimeout(timers.get(entry.target))
            timers.delete(entry.target)
          }
        })
      },
      { threshold: [0, 0.25, 0.45] },
    )
    function registerElements() {
      const elements = [...root.querySelectorAll(explorationSelector)]
      elements.forEach((element, index) => {
        if (observed.has(element)) return
        observed.add(element)
        keys.set(element, itemKey(element, index))
        observer.observe(element)
      })
    }

    registerElements()
    const mutationObserver = new MutationObserver(registerElements)
    mutationObserver.observe(root, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [onExplore, section])

  function trackAction(event) {
    const target = event.target.closest('button, a, input, select, textarea, [role="button"]')
    if (!target || !trackerRef.current?.contains(target)) return
    const elements = [...trackerRef.current.querySelectorAll('button, a, input, select, textarea, [role="button"]')]
    const index = elements.indexOf(target)
    const label = target.dataset.progressKey || target.getAttribute('aria-label') || target.textContent || target.tagName
    const slug = String(label).trim().toLowerCase().replace(/[^a-z0-9:_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || 'control'
    const key = `${slug}:${Math.max(index, 0)}`
    if (actedRef.current.has(`${section}:${key}`)) return
    actedRef.current.add(`${section}:${key}`)
    onExplore(section, key, 'action')
  }

  return <div className="exploration-tracker" ref={trackerRef} onClickCapture={trackAction}>{children}</div>
}
