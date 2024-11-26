'use client'

import { Mic, Plus, Video } from "lucide-react";
import { SegmentedButtonDropdown } from "./SegmentedButtonDropdown";
import styles from './page.module.scss';

const micOptions = [ 'MacBook Pro Microphone (Built in microphone)', "Sarah's Airpods", 'Line in (BlackMagic DeckLink Mini Recorder Audio)']

export default function Home() {
  return (
    <div className={styles.root}>
      <video src="https://pub-ac0a62efbd7142ae861959aa8df00996.r2.dev/test.mp4" autoPlay muted loop />
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