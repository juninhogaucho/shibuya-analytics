import { type PropsWithChildren } from 'react'

interface SectionProps extends PropsWithChildren {
  eyebrow?: string
  title: string
  description?: string
  alignment?: 'left' | 'center'
  id?: string
}

export function Section({
  eyebrow,
  title,
  description,
  alignment = 'left',
  id,
  children,
}: SectionProps) {
  return (
    <section id={id} className="section-block">
      <div className={`section-header section-header--${alignment}`}>
        {eyebrow && <p className="badge">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="text-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}
