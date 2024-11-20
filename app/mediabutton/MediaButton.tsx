import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from './MediaButton.module.scss';
import { Mic, ChevronDown } from 'lucide-react'

export function MediaButton() {
  return (
    <SegmentedButtonDropdown>
      <ButtonWithToolTip />
    </SegmentedButtonDropdown>
  )
}

function SegmentedButtonDropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      {children}
      <button className={styles.button}><ChevronDown /></button>
    </div>
  )
}

function ButtonWithToolTip() {
  return (
    <div>
      <div className={styles.testButton}>
        <Mic />
      </div>
    </div>
  )
}