'use client'

import { Mic, Plus, Video } from "lucide-react";
import { SegmentedButtonDropdown } from "./SegmentedButtonDropdown";
import styles from './page.module.scss';
import { useState } from "react";

const micOptions = [ 'MacBook Pro Microphone (Built in microphone)', "Sarah's Airpods", 'Line in (BlackMagic DeckLink Mini Recorder Audio)']

export default function Home() {
  const [showVideo, setShowVideo] = useState(true)
  const [lightBackground, setLightBackground] = useState(false)

  return (
    <div className={styles.root} style={{ backgroundColor: !lightBackground ? 'initial' : 'white' }}>
      <div>
        <button onClick={() => setShowVideo(!showVideo)}>Toggle Video</button>
        <button onClick={() => setLightBackground(!lightBackground)}>Toggle Background</button>
      </div>
      <div className={styles.videoPlaceholder}>
        <video style={{ opacity: !showVideo ? 0 : 1, display: 'block' }} src="https://pub-ac0a62efbd7142ae861959aa8df00996.r2.dev/test.mp4" autoPlay muted loop />
      </div>
      <div className={styles.testContainer}>
      <SegmentedButtonDropdown options={micOptions}>
        <ButtonWithToolTip>
          <Mic />
        </ButtonWithToolTip>
      </SegmentedButtonDropdown>
      <SegmentedButtonDropdown options={micOptions}>
        <ButtonWithToolTip>
          <Video />
        </ButtonWithToolTip>
      </SegmentedButtonDropdown>
      <ButtonWithToolTip>
        <Mic />
      </ButtonWithToolTip>
      <ButtonWithToolTip>
        <Mic />
      </ButtonWithToolTip>
      <ButtonWithToolTip>
        <Plus />
      </ButtonWithToolTip>
      <ButtonWithToolTip>
        <Mic />
      </ButtonWithToolTip>
      </div>
    </div>
  );
}

function ButtonWithToolTip({ children }: { children: React.ReactNode }) {
  return (
    <button className={styles.testButton}>
      {children}
    </button>
  )
}