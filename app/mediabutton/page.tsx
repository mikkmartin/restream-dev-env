'use client'

import { MediaButton } from "./MediaButton2";
import styles from './page.module.scss';
export default function Home() {
  return (
    <div className={styles.root}>
      <video src="https://pub-ac0a62efbd7142ae861959aa8df00996.r2.dev/test.mp4" autoPlay muted loop />
      <MediaButton />
    </div>
  );
}
