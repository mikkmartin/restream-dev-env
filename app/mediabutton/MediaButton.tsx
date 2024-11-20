import * as Select from "@radix-ui/react-select";
import styles from './MediaButton.module.scss';
import { Mic, ChevronDown, CheckIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useState } from "react";

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
const Trigger = motion(Select.Trigger)

function SegmentedButtonDropdown({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(options[0])

  return (
    <motion.div className={styles.root}>
      {children}
      <Select.Root open={isOpen} onOpenChange={setIsOpen} value={selected} onValueChange={setSelected}>
        <Trigger className={styles.Trigger}>
          {/* {isOpen && <Select.Value />} */}
          <Select.Icon className={styles.Icon} asChild>
            <ChevronDown />
          </Select.Icon>
        </Trigger>
        <Select.Portal>
          <Select.Content sideOffset={-52} alignOffset={-4} position="popper" side="top" align="start" className={styles.Content}>
            <Select.Viewport className={styles.Viewport}>
              {options.sort((a) => a === selected ? 1 : -1).map((option) => (
                <SelectItem selected={option === selected} key={option} className={styles.Item} value={option}>{option}</SelectItem>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </motion.div>
  )
}


interface SelectItemProps extends Select.SelectItemProps {
  selected: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, selected, ...props }, forwardedRef) => {
    return (
      <Select.Item
        className={className}
        {...props}
        ref={forwardedRef}
      >
        {selected ? <CheckIcon /> : <Mic />}
        <Select.ItemText className={styles.Label}>{children}</Select.ItemText>
      </Select.Item>
    );
  },
);


function ButtonWithToolTip() {
  return (
    <button className={styles.testButton}>
      <Mic />
    </button>
  )
}