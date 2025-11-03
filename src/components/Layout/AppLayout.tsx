import { useState } from 'react'
import type { ReactNode } from 'react'
import classes from './AppLayout.module.css'

interface AppLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  const [sidebarOpen] = useState(true)

  return (
    <div className={classes.container}>
      <div className={classes.layout}>
        <main className={classes.main}>
          {/*<button*/}
          {/*  className={classes.toggleButton}*/}
          {/*  onClick={() => setSidebarOpen(!sidebarOpen)}*/}
          {/*  aria-label={sidebarOpen ? 'Hide lessons' : 'Show lessons'}*/}
          {/*  aria-expanded={sidebarOpen}*/}
          {/*>*/}
          {/*  {sidebarOpen ? '→' : '←'}*/}
          {/*</button>*/}
          {children}
        </main>

        {sidebarOpen && <aside className={classes.sidebar}>{sidebar}</aside>}
      </div>
    </div>
  )
}
