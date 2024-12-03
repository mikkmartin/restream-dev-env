import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React, { createContext, useContext, useState } from 'react'
import styles from './MediaSelect.module.scss'
import { observer } from 'mobx-react-lite'

interface MediaSelectContextType {
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
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>) => (
  <DropdownMenu.Content className={styles.Content}>
    {children}
  </DropdownMenu.Content>
)

interface ItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Item> {
  selected?: boolean
}

const Item = ({ children, selected, ...props }: ItemProps) => (
  <DropdownMenu.Item className={styles.Item} {...props}>
    {children}
  </DropdownMenu.Item>
)

interface RootProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DropdownMenu.Root>,
    'modal' | 'open' | 'onOpenChange'
  > {}

const Root = observer(({ children, ...rest }: RootProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MediaSelectContext.Provider value={{ isOpen, setIsOpen }}>
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
