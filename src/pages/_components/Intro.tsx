import type { ReactNode } from 'react'

export function Intro(props: { children: ReactNode }) {
  return (
    <p className="doc-intro">
      <span className="doc-intro-label">Introduction</span>
      {props.children}
    </p>
  )
}
