import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from './MediaButton.module.scss';
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
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={styles.testContainer}>
      <SegmentedButtonDropdown onOpenChange={setIsOpen}>
        <ButtonWithToolTip />
      </SegmentedButtonDropdown>
      <motion.div className={styles.testContainer} transition={transition} animate={{ x: isOpen ? 60 : 0 }}>
        <SegmentedButtonDropdown>
          <ButtonWithToolTip />
        </SegmentedButtonDropdown>
        <ButtonWithToolTip />
        <ButtonWithToolTip />
      </motion.div>
    </div>
  )
}

const OPENDELAY_MS = 100
const options = ['External microphone', 'MacBook Pro Microphone (Built in microphone)']

function SegmentedButtonDropdown({ children, onOpenChange }: { children: React.ReactNode, onOpenChange?: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(options[0])
  const canSelect = useRef(true)

  return (
    <motion.div className={styles.root}>
      <DropdownMenu.Root open={isOpen} onOpenChange={(open) => {
        if (open) {
          setTimeout(() => canSelect.current = true, OPENDELAY_MS)
          setIsOpen(open)
          onOpenChange?.(open)
          return
        }
        if (!canSelect.current) return
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
                sideOffset={-52}
                alignOffset={-4}
                side="top"
                align="start"
                className={styles.Content}
                forceMount
                asChild
              >
                <motion.div
                  transition={transition}
                  initial={{ height: 52, width: 52, x: 2, y: 0, scale: .9 }}
                  animate={{ height: 'auto', width: 'auto', x: 0, y: 0, scale: 1 }}
                  exit={{ height: 52, width: 52, x: 2, y: 0, scale: .9 }}
                  onAnimationStart={() => canSelect.current = false}
                  onAnimationComplete={() => canSelect.current = true}
                >
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