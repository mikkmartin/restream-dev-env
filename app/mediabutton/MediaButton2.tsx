import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from './MediaButton2.module.scss';
import { Mic, ChevronDown, CheckIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useRef, useState } from "react";

// const transition = { duration: 0.2 }
const slowmo = { duration: 2 }
const bouncy = { type: 'spring', stiffness: 500, damping: 25, mass: 1 }
const smooth = { type: 'spring', stiffness: 500, damping: 60, mass: 1 }
const snappy = { type: 'spring', stiffness: 1000, damping: 20, mass: 0.01 }
const smooth2 = { type: 'spring', stiffness: 800, damping: 60, mass: .1 }

const transition = smooth2
// const transition = {}

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

const options = [
  'MacBook Pro Microphone (Built in microphone)',
  'Sarah\'s Airpods',
  'Line in (BlackMagic DeckLink Mini Recorder Audio)'
]

function SegmentedButtonDropdown({ children, onOpenChange }: { children: React.ReactNode, onOpenChange?: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(options[0])

  return (
    <motion.div className={styles.root}>
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <motion.button className={styles.Trigger}>
            <ChevronDown className={styles.Icon} />
          </motion.button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal forceMount>
          <AnimatePresence>
            {isOpen && (
              <DropdownMenu.Content
                side="top"
                align="start"
                key="viewport"
                className={styles.Content}
                forceMount
                asChild
              >
                <motion.div
                  className={styles.Viewport}
                >
                  {options.map((option, i) => (
                    <Item
                      key={option}
                      className={styles.Item}
                      onSelect={() => setSelected(option)}
                    >
                      <motion.div className={styles.Icon}>
                        {option === selected ? <CheckIcon /> : <Mic />}
                      </motion.div>
                      <motion.span className={styles.Label}>{option}</motion.span>
                    </Item>
                  ))}
                </motion.div>
              </DropdownMenu.Content>
            )}</AnimatePresence>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {children}
    </motion.div>
  )
}

const Item = motion(DropdownMenu.Item)

function ButtonWithToolTip() {
  return (
    <button className={styles.testButton}>
      <Mic />
    </button>
  )
}