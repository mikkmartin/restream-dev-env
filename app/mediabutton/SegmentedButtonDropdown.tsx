import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import styles from './SegmentedButtonDropdown.module.scss'
import { Mic, CheckIcon, ChevronDown, X } from 'lucide-react'

// const CheckIcon = (_: { className?: string }) => null
// const ChevronDown = (_: { className?: string }) => null
// const Mic = (_: { className?: string }) => null
// const X = (_: { className?: string }) => null

// const transition = { duration: 0.2 }
// const slowmo = { duration: 2 }
// const bouncy = { type: 'spring', stiffness: 500, damping: 25, mass: 1 }
// const smooth = { type: 'spring', stiffness: 500, damping: 60, mass: 1 }
// const snappy = { type: 'spring', stiffness: 1000, damping: 20, mass: 0.01 }
const smooth2 = { type: 'spring', stiffness: 800, damping: 60, mass: 0.1 }

const transition = smooth2

const ConditionalWrapper = ({
  condition,
  wrapper,
  children
}: {
  condition: boolean,
  wrapper: (children: React.ReactNode) => React.ReactNode,
  children: React.ReactNode
}) => {
  return condition ? wrapper(children) : children;
};

export function SegmentedButtonDropdown({
  children,
  options,
  onValueChange,
  asSegmentedButton,
}: {
  children: React.ReactNode
  onValueChange?: (value: string) => void
  options: string[]
  asSegmentedButton?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, _setSelected] = useState(options[0])
  const pointerEvents = useMotionValue<'none' | 'auto'>('none')

  const setSelected = (value: string) => {
    _setSelected(value)
    onValueChange?.(value)
  }

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
    <ConditionalWrapper
      condition={Boolean(asSegmentedButton)}
      wrapper={children => <motion.div className={styles.root}>{children}</motion.div>}
    >
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenu.Trigger asChild>
          {!asSegmentedButton ? children : <motion.button className={styles.Trigger}>
            <motion.div
              initial={false}
              animate={{
                x: !isOpen ? 0 : -22,
                rotate: !isOpen ? 0 : 180,
                opacity: !isOpen ? 1 : 0,
              }}
              transition={transition}
            >
              <ChevronDown className={styles.Icon} />
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                x: !isOpen ? 0 : -22,
                rotate: !isOpen ? -180 : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={transition}
            >
              <X className={styles.Icon} />
            </motion.div>
          </motion.button>
          }
        </DropdownMenu.Trigger>

        <AnimatePresence>
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
                    },
                  }}
                />
                {options.map((option, i) => (
                  <DropdownMenu.Item
                    key={option}
                    onSelect={() => setSelected(option)}
                    asChild
                  >
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
                          transition: {
                            ...transition,
                            delay: 0.01 * (options.length - i),
                          },
                        },
                        hidden: {
                          y: 54 * (options.length - i),
                          opacity: 0,
                          transition: { duration: 0.1 },
                        },
                      }}
                    >
                      <motion.div
                        className={styles.Icon}
                        transition={transition}
                        variants={{
                          visible: { opacity: 1, scale: 1 },
                          hidden: {
                            opacity: 0,
                            scale: 0.1,
                            transition: { duration: 0.1 },
                          },
                        }}
                      >
                        {option === selected ? <CheckIcon /> : <Mic />}
                      </motion.div>
                      <motion.div
                        className={styles.Label}
                        transition={{ duration: 0.1 }}
                        variants={{
                          visible: {
                            opacity: 1,
                            transition: { ...transition, delay: 0.1 },
                          },
                          hidden: { opacity: 0 },
                        }}
                      >
                        {/* {option === selected && (
                          <motion.small className={styles.SelectedLabel}>
                            Selected device
                          </motion.small>
                        )} */}
                        <span>{option}</span>
                      </motion.div>
                    </motion.div>
                  </DropdownMenu.Item>
                ))}
              </motion.div>
            </DropdownMenu.Content>
          )}
        </AnimatePresence>
      </DropdownMenu.Root>
      {asSegmentedButton &&
        <motion.div
          className={styles.childContainer}
          animate={{
            scale: isOpen ? 0.9 : 1,
            y: !isOpen ? 0 : -30,
            opacity: !isOpen ? 1 : 0,
          }}
          transition={{
            ...transition,
            opacity: { duration: 0.1 },
          }}
        >
          {children}
        </motion.div>
      }
    </ConditionalWrapper >
  )
}