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

const options = ['External microphone', 'MacBook Pro Microphone (Built in microphone)']

function SegmentedButtonDropdown({ children, onOpenChange }: { children: React.ReactNode, onOpenChange?: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(options[0])

  return (
    <motion.div className={styles.root}>
      <DropdownMenu.Root open={isOpen} onOpenChange={(open) => {
        if (open) {
          setIsOpen(open)
          onOpenChange?.(open)
          return
        }
        setIsOpen(false)
        onOpenChange?.(false)
      }}>
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
                className={styles.Content}
                forceMount
                asChild
              >
                <motion.div transition={transition}>
                  <div className={styles.Viewport}>
                    {options.sort((a) => a === selected ? 1 : -1).map((option) => (
                      <DropdownMenu.Item
                        key={option}
                        className={styles.Item}
                      >
                        {/* {option === selected ? <CheckIcon /> : <Mic />} */}
                        <Mic />
                        <motion.span transition={transition} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.Label}>{option}</motion.span>
                      </DropdownMenu.Item>
                    ))}
                  </div>
                </motion.div>
              </DropdownMenu.Content>
            )}</AnimatePresence>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {children}
    </motion.div>
  )
}

function ButtonWithToolTip() {
  return (
    <button className={styles.testButton}>
      <Mic />
    </button>
  )
}