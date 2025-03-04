'use client'

import { useEffect } from 'react'
import styles from './page.module.scss'
import { Canvas } from './components/Canvas'
import { EditPanel } from './components/EditPanel'
import { useAtom } from 'jotai'
import { isCommandPressedAtom } from './atoms'

export default function Page() {
  const [, setIsCommandPressed] = useAtom(isCommandPressedAtom)

  // Handle key events for precise movement
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey) {
      setIsCommandPressed(true)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!e.metaKey) {
      setIsCommandPressed(false)
    }
  }

  // Add event listeners when component mounts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div className={styles.container}>
      <Canvas />
      <EditPanel />
    </div>
  )
}
