import Image from "next/image";
import styles from "./page.module.css";
import { SliderV2 } from "./SliderV2";
import { AlarmClock } from 'lucide-react'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SliderV2 labelSuffix="%" />
      </main>
    </div>
  );
}
