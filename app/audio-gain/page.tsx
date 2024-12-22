'use client'

import { AudioGain } from './AudioGain'
import styles from './page.module.scss'

export default function Home() {
  return (
    <div className={styles.root}>
      <AudioGain />
    </div>
  )
}
