'use client'

import { motion } from 'motion/react'
import { ComponentProps, CSSProperties, forwardRef } from 'react'
import { Shape } from '../types'
import styles from '../page.module.scss'

const transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 1,
} as const

type CanvasElementProps = ComponentProps<typeof motion.div> & {
  shape?: Shape
  multiple?: boolean
  snapIndex: number | null
  scale: number
}

export const CanvasElement = forwardRef<HTMLDivElement, CanvasElementProps>(
  function CanvasElement(props, ref) {
    const getStyles = (): CSSProperties => {
      switch (props.snapIndex) {
        case 0:
        case 2:
          return {
            flexDirection: 'row',
          }
        case 6:
          return {
            flexDirection: 'column',
          }
        case 1:
        case 7:
        case 3:
          return {
            flexDirection: 'row-reverse',
          }
        case 4:
        case 5:
          return {
            flexDirection: 'row',
            justifyContent: 'center',
          }
        default:
          return {
            flexDirection: 'column-reverse',
          }
      }
    }

    if (props.multiple) {
      const finalStyles = {
        x: props.style?.x,
        y: props.style?.y,
        aspectRatio: props.style?.aspectRatio,
        borderRadius: props.style?.borderRadius,
        ...getStyles(),
      }
      return (
        <motion.div
          {...props}
          ref={ref}
          className={styles.ghostContainer}
          style={finalStyles}
        >
          <motion.div
            layout
            transition={transition}
            className={styles.movableElement}
          />
          {props.scale <= 1.2 && (
            <motion.div
              layout
              transition={transition}
              className={styles.ghostElement}
            />
          )}
          {props.scale <= 0.7 && (
            <motion.div
              layout
              transition={transition}
              className={styles.ghostElement}
            />
          )}
        </motion.div>
      )
    }
    return <motion.div {...props} ref={ref} className={styles.movableElement} />
  },
)
