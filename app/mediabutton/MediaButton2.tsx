import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from './MediaButton2.module.scss';
import { Mic, Plus, ChevronDown, CheckIcon, X, Video } from 'lucide-react'
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
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenu.Trigger asChild>
          <motion.button className={styles.Trigger}>
            <motion.div initial={false} animate={{ x: !isOpen ? 0 : -22, rotate: !isOpen ? 0 : 180, opacity: !isOpen ? 1 : 0 }} transition={transition}>
              <ChevronDown className={styles.Icon} />
            </motion.div>
            <motion.div initial={false} animate={{ x: !isOpen ? 0 : -22, rotate: !isOpen ? -180 : 0, opacity: isOpen ? 1 : 0 }} transition={transition}>
              <X className={styles.Icon} />
            </motion.div>
          </motion.button>
        </DropdownMenu.Trigger>

        <AnimatePresence mode="wait">
          {isOpen && (
            <DropdownMenu.Content
              side="top"
              align="start"
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
              >
                <motion.div
                  transition={transition}
                  className={styles.overlay}
                  style={{ transformOrigin: 'bottom left' }}
                  variants={{
                    visible: {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    },
                    hidden: {
                      opacity: 0,
                      scale: 0.7,
                      y: 0,
                    }
                  }}
                />
                {options.map((option, i) => (
                  <DropdownMenu.Item key={option} onSelect={() => setSelected(option)} asChild>
                    <motion.div
                      className={styles.Item}
                      data-selected={option === selected}
                      onSelect={() => setSelected(option)}
                      transition={transition}
                      style={{ transformOrigin: 'bottom left' }}
                      variants={{
                        visible: {
                          y: 0,
                          opacity: 1,
                          transition: { ...transition, delay: .01 * (options.length - i) }
                        },
                        hidden: {
                          y: 54 * (options.length - i),
                          opacity: 0,
                          transition: { duration: 0.1 }
                        },
                      }}
                    >
                      <motion.div
                        className={styles.Icon}
                        transition={transition}
                        variants={{
                          visible: { opacity: 1, scale: 1 },
                          hidden: { opacity: 0, scale: 0.1, transition: { duration: 0.1 } },
                        }}
                      >
                        {option === selected ? <CheckIcon /> : <Mic />}
                      </motion.div>
                      <motion.div
                        className={styles.Label}
                        transition={{ duration: 0.1 }}
                        variants={{
                          visible: { opacity: 1, transition: { ...transition, delay: 0.1 } },
                          hidden: { opacity: 0 },
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
      </DropdownMenu.Root>
      <motion.div
        animate={{
          scale: isOpen ? 0.9 : 1,
          y: !isOpen ? 0 : -30,
          opacity: !isOpen ? 1 : 0
        }}
        transition={{
          ...transition,
          opacity: { duration: 0.1 }
        }}
      >
        {children}
      </motion.div>
    </motion.div >
  )
}


function ButtonWithToolTip({ children }: { children: React.ReactNode }) {
  return (
    <button className={styles.testButton}>
      {children}
    </button>
  )
}