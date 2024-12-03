import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React, { createContext, useContext, useId, useState } from 'react'
import styles from './MediaSelect.module.scss'
import { observer } from 'mobx-react-lite'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon } from 'lucide-react'

const SPRING_TRANSITION_SMOOTH = {
  type: 'spring',
  stiffness: 800,
  damping: 60,
  mass: 0.1,
}

const SPRING_TRANSITION_STIFF = {
  type: 'spring',
  stiffness: 1000,
  damping: 20,
  mass: 0.01,
}

interface MediaSelectContextType {
  uuid: string
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

const MediaSelectContext = createContext<MediaSelectContextType | undefined>(
  undefined,
)

export const useMediaSelect = () => {
  const context = useContext(MediaSelectContext)
  if (!context) {
    throw new Error('useMediaSelect must be used within a MediaSelectProvider')
  }
  return context
}

const Content = ({
  children,
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>) => {
  const { isOpen } = useMediaSelect()

  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenu.Content
          key="content"
          className={styles.content}
          side="top"
          align="start"
          sideOffset={8}
          forceMount
          asChild
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  staggerDirection: -1,
                },
              },
            }}
          >
            <motion.div
              className={styles.overlay}
              transition={SPRING_TRANSITION_SMOOTH}
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
            {children}
          </motion.div>
        </DropdownMenu.Content>
      )}
    </AnimatePresence>
  )
}

interface ItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu.RadioItem> {
  defaultFocused?: boolean
}

const RadioItem = ({ children, defaultFocused, ...props }: ItemProps) => {
  const [isFocused, setIsFocused] = useState(defaultFocused || false)
  const { uuid } = useMediaSelect()

  return (
    <DropdownMenu.RadioItem
      {...props}
      asChild
      className={styles.item}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <motion.div
        className={styles.item}
        transition={SPRING_TRANSITION_SMOOTH}
        variants={{
          hidden: {
            opacity: 0,
            y: 54,
          },
          visible: {
            opacity: 1,
            y: 0,
          },
        }}
      >
        <DropdownMenu.ItemIndicator className={styles.checkbox}>
          <CheckIcon />
        </DropdownMenu.ItemIndicator>
        {children}
        {isFocused && (
          <motion.div
            transition={SPRING_TRANSITION_STIFF}
            className={styles.highlight}
            layoutId={uuid}
          />
        )}
      </motion.div>
    </DropdownMenu.RadioItem>
  )
}

interface RootProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DropdownMenu.Root>,
    'modal' | 'open' | 'onOpenChange'
  > {}

const Root = observer(({ children, ...rest }: RootProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const uuid = useId()

  return (
    <MediaSelectContext.Provider value={{ uuid, isOpen, setIsOpen }}>
      <DropdownMenu.Root
        modal={false}
        open={isOpen}
        onOpenChange={setIsOpen}
        {...rest}
      >
        {children}
      </DropdownMenu.Root>
    </MediaSelectContext.Provider>
  )
})

const Trigger = DropdownMenu.Trigger
const RadioGroup = DropdownMenu.RadioGroup
export { Content, RadioItem, Root, Trigger, RadioGroup }
