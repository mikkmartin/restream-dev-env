'use client'

import {
  AnimatePresence,
  motion,
  MotionConfig,
  useAnimate,
} from 'framer-motion'
import { useEffect, useRef } from 'react'

import { ChevronIcon } from './assets/ChevronIcon'
import { PrivateChatIcon } from './assets/PrivateChatIcon'
import styles from './PrivateChatV2.module.scss'

const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30,
}

export const PrivateChatV2 = ({
  typingUsers,
  messages,
}: {
  typingUsers: string[]
  messages: {
    sender: string
    content: string
  }[]
}) => {
  const [scope, animate] = useAnimate()
  const prevMessages = usePrevious(messages)

  const isTyping = typingUsers.length > 0
  const lastMessage = messages[messages.length - 1]

  const unread = Boolean(lastMessage)

  useEffect(() => {
    const startingBackground = getComputedStyle(
      scope.current as Element,
    ).backgroundColor

    async function onNewMessage() {
      await animate(
        scope.current,
        {
          backgroundColor: ['#ffffff', startingBackground],
          color: [startingBackground, '#ffffff'],
          scaleX: [1.01, 1],
          scaleY: [1.01, 1],
        },
        {
          backgroundColor: { duration: 0.15 },
          color: { duration: 0.5 },
          scaleX: {
            type: 'spring',
            velocity: 5,
            stiffness: 700,
            damping: 80,
          },
          scaleY: {
            type: 'spring',
            velocity: 2,
            stiffness: 700,
            damping: 80,
          },
        },
      )
    }

    if (messages.length > 0 && prevMessages?.length !== messages.length) {
      onNewMessage()
    }
  }, [messages, animate, scope, prevMessages])

  return (
    <MotionConfig transition={spring}>
      <div ref={scope} className={styles.root} data-unread={unread}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={!isTyping ? 'default' : 'typing'}
            className={styles.icon}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            {!isTyping ? <PrivateChatIcon /> : <AnimatedDots />}
          </motion.div>
        </AnimatePresence>
        <div className={styles.content} style={{ flex: 1 }}>
          {lastMessage || isTyping ? (
            <motion.span
              layoutId="title"
              className={styles.smallText}
              animate={{ opacity: 0.5 }}
            >
              Private Chat{lastMessage && ' ⋅ ' + lastMessage.sender}
            </motion.span>
          ) : (
            <motion.span layoutId="title" className={styles.largeText}>
              Private Chat
            </motion.span>
          )}

          <AnimatePresence mode="popLayout" initial={false}>
            {isTyping && (
              <motion.span
                key="typing"
                className={styles.largeText}
                style={{ width: '100%', fontStyle: 'italic' }}
                transition={{ ...spring, opacity: { duration: 0.1 } }}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 7 }}
              >
                {typingUsers.join(', ')} is typing...
              </motion.span>
            )}
            {!isTyping && lastMessage && (
              <motion.span
                key={lastMessage.content}
                className={styles.largeText}
                style={{ width: '100%' }}
                transition={{ ...spring, opacity: { duration: 0.1 } }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {lastMessage?.content}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className={styles.icon}>
          <ChevronIcon />
        </div>
      </div>
    </MotionConfig>
  )
}

function AnimatedDots() {
  return (
    <motion.div className={styles.dots}>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className={styles.dot}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )
}

function usePrevious(value: any) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
