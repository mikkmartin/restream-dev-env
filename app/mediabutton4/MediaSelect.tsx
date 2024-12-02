import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'
import styles from './MediaSelect.module.scss'

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

const Root = DropdownMenu.Root
const Trigger = DropdownMenu.Trigger

export { Content, Item, Root, Trigger }
