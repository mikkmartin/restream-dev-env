'use client'

import { Mic, Plus, Video } from "lucide-react";
import { SegmentedButtonDropdown } from "./MediaButton2";
import styles from './page.module.scss';
export default function Home() {
  return (
    <div className={styles.root}>
      <video src="https://pub-ac0a62efbd7142ae861959aa8df00996.r2.dev/test.mp4" autoPlay muted loop />
      <div className={styles.testContainer}>
      <SegmentedButtonDropdown>
        <ButtonWithToolTip>
          <Mic />
        </ButtonWithToolTip>
      </SegmentedButtonDropdown>
      <SegmentedButtonDropdown>
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