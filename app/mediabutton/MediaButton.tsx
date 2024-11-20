import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from './MediaButton.module.scss';
import { Mic, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from "react";

export function MediaButton() {
  return (
    <div className={styles.testContainer}>
      <SegmentedButtonDropdown>
        <ButtonWithToolTip />
      </SegmentedButtonDropdown>
      <SegmentedButtonDropdown>
        <ButtonWithToolTip />
      </SegmentedButtonDropdown>
      <ButtonWithToolTip />
      <ButtonWithToolTip />
    </div>
  )
}

function SegmentedButtonDropdown({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.root}>
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        {children}
        <DropdownMenu.Trigger className={styles.button}>
          <ChevronDown />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal forceMount>
          <AnimatePresence>
            {isOpen &&
              <DropdownMenu.Content key="content" forceMount asChild>
                <motion.div
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <DropdownMenu.RadioGroup>
                    <DropdownMenu.RadioItem value="asdasd2">
                      asdasd
                    </DropdownMenu.RadioItem>
                    <DropdownMenu.RadioItem value="asdasd2">
                      asdasd
                    </DropdownMenu.RadioItem>
                  </DropdownMenu.RadioGroup>
                </motion.div>
              </DropdownMenu.Content>
            }
          </AnimatePresence>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}

function ButtonWithToolTip() {
  return (
    <button className={styles.testButton}>
      <Mic />
    </button>
  )
}