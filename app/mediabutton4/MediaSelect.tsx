import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React, { createContext, useContext, useId, useState } from 'react'
import styles from './MediaSelect.module.scss'
import { observer } from 'mobx-react-lite'
import { AnimatePresence, motion } from 'framer-motion'

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
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Item> {
  selected?: boolean
}

const Item = ({ children, selected, ...props }: ItemProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const { uuid } = useMediaSelect()

  return (
    <DropdownMenu.Item
      asChild
      {...props}
      className={styles.item}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <motion.div
        className={styles.item}
        variants={{
          hidden: {
            opacity: 0,
          },
          visible: {
            opacity: 1,
          },
        }}
      >
        {children}
        {isFocused && (
          <motion.div
            transition={SPRING_TRANSITION_STIFF}
            className={styles.highlight}
            layoutId={uuid}
          />
        )}
      </motion.div>
    </DropdownMenu.Item>
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
export { Content, Item, Root, Trigger }
