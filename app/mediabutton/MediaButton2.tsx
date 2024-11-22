import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from './MediaButton2.module.scss';
import { Mic, ChevronDown, CheckIcon } from 'lucide-react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import React, { useEffect, useRef, useState } from "react";

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
  const pointerEvents = useMotionValue<'none' | 'auto'>('none')

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        pointerEvents.set('auto')
      }, 100)
    } else {
      pointerEvents.set('none')
    }
  }, [isOpen])

  return (
    <motion.div className={styles.root}>
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <motion.button className={styles.Trigger}>
            <ChevronDown className={styles.Icon} />
          </motion.button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal forceMount>
          <AnimatePresence mode="wait">
            {isOpen && (
              <DropdownMenu.Content
                side="top"
                align="start"
                className={styles.Content}
                sideOffset={8}
                forceMount
                asChild
              >
                <motion.div
                  className={styles.Viewport}
                  key="viewport"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.1 }}
                  style={{ pointerEvents }}
                // variants={{
                //   hidden: { opacity: 0 },
                //   visible: { opacity: 1 }
                // }}
                >
                  {options.map((option, i) => (
                    <DropdownMenu.Item key={option} onSelect={() => setSelected(option)} asChild>
                      <motion.div
                        className={styles.Item}
                        data-selected={option === selected}
                        onSelect={() => setSelected(option)}
                        transition={transition}
                        style={{ transformOrigin: 'bottom left' }}
                        variants={{
                          hidden: {
                            y: 54 * (options.length - i),
                            opacity: 0
                          },
                          visible: {
                            y: 0,
                            opacity: 1,
                            transition: { ...transition, delay: .01 * (options.length - i) }
                          }
                        }}
                      >
                        <motion.div
                          className={styles.Icon}
                          transition={transition}
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 }
                          }}
                        >
                          {option === selected ? <CheckIcon /> : <Mic />}
                        </motion.div>
                        <motion.div
                          className={styles.Label}
                          transition={{ duration: 0.1 }}
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 }
                          }}
                        >
                          {option === selected &&
                            <motion.small className={styles.SelectedLabel}>Selected device</motion.small>
                          }
                          <span>{option}</span>
                        </motion.div>
                      </motion.div>
                    </DropdownMenu.Item>
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


function ButtonWithToolTip() {
  return (
    <button className={styles.testButton}>
      <Mic />
    </button>
  )
}