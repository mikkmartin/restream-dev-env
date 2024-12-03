'use client'

import { Camera, Mic, Plus as PlusBase, Video } from 'lucide-react'
import * as MediaSelect from './MediaSelect'
import styles from './page.module.scss'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ButtonSegment } from './ButtonSegment'
import { Observer } from 'mobx-react-lite'
import { useMediaSelect } from './MediaSelect'

const micOptions = [
  'MacBook Pro Microphone (Built in microphone)',
  "Sarah's Airpods",
  'Line in (BlackMagic DeckLink Mini Recorder Audio)',
]

const camOptions = [
  'MacBook Pro Camera (Built in camera)',
  'Logitech C920 HD Pro Webcam',
  'Elgato Facecam',
  'Sony Alpha a7 III (via Cam Link)',
  'Canon EOS R5 (via HDMI)',
]

export default function Home() {
  const [lightBackground, setLightBackground] = useState(false)
  const [selectedMic, setSelectedMic] = useState(micOptions[0])
  const [selectedCam, setSelectedCam] = useState(camOptions[0])
  const [showVideo, setShowVideo] = useState(true)

  return (
    <div
      className={styles.root}
      style={{ backgroundColor: !lightBackground ? 'initial' : 'white' }}
    >
      <div>
        <button onClick={() => setShowVideo(!showVideo)}>Toggle Video</button>
        <button onClick={() => setLightBackground(!lightBackground)}>
          Toggle Background
        </button>
      </div>
      <div className={styles.videoPlaceholder}>
        <video
          style={{ opacity: !showVideo ? 0 : 1, display: 'block' }}
          src="https://pub-ac0a62efbd7142ae861959aa8df00996.r2.dev/test.mp4"
          autoPlay
          muted
          loop
        />
      </div>
      <div className={styles.testContainer}>
        {/* SelectMic */}
        <MediaSelect.Root>
          <MediaSelect.Trigger asChild>
            <ButtonSegment>
              <ButtonWithToolTip>
                <Mic />
              </ButtonWithToolTip>
            </ButtonSegment>
          </MediaSelect.Trigger>
          <MediaSelect.Content>
            {micOptions.map((option) => (
              <MediaSelect.Item key={option} selected={selectedMic === option}>
                {option}
              </MediaSelect.Item>
            ))}
          </MediaSelect.Content>
        </MediaSelect.Root>

        {/* SelectCam */}
        <MediaSelect.Root>
          <MediaSelect.Trigger asChild>
            <ButtonSegment>
              <ButtonWithToolTip>
                <Video />
              </ButtonWithToolTip>
            </ButtonSegment>
          </MediaSelect.Trigger>
          <MediaSelect.Content>
            {camOptions.map((option) => (
              <MediaSelect.Item
                key={option}
                textValue={option}
                selected={selectedCam === option}
              >
                {option}
              </MediaSelect.Item>
            ))}
          </MediaSelect.Content>
        </MediaSelect.Root>

        {/* Add Media */}
        <MediaSelect.Root>
          <Observer>
            {() => {
              const { isOpen } = useMediaSelect()
              return (
                <MediaSelect.Trigger asChild>
                  <ButtonWithToolTip>
                    <Plus animate={{ rotate: isOpen ? -45 : 0 }} />
                  </ButtonWithToolTip>
                </MediaSelect.Trigger>
              )
            }}
          </Observer>
          <MediaSelect.Content>
            <MediaSelect.Item>Option 1</MediaSelect.Item>
            <MediaSelect.Item>Option 2</MediaSelect.Item>
            <MediaSelect.Item>Option 3</MediaSelect.Item>
          </MediaSelect.Content>
        </MediaSelect.Root>
      </div>
    </div>
  )
}

const Plus = motion.create(PlusBase)

function ButtonWithToolTip({
  children,
  ...props
}: {
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={styles.testButton} {...props}>
      {children}
    </button>
  )
}
