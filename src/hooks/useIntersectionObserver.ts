import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(options = {}) {
  const [elements, setElements] = useState<Element[]>([])
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([])

  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (elements.length > 0) {
      observer.current = new IntersectionObserver((observedEntries) => {
        setEntries(observedEntries)
        observedEntries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            // Optional: Stop observing once visible if you only want it to animate once
            // observer.current?.unobserve(entry.target)
          }
        })
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
      })

      elements.forEach(el => observer.current?.observe(el))

      return () => {
        if (observer.current) {
          observer.current.disconnect()
        }
      }
    }
  }, [elements, options])

  const observe = (el: Element | null) => {
    if (el && !elements.includes(el)) {
      setElements(prev => [...prev, el])
    }
  }

  return { observe, entries }
}
