'use client'

import { Mic, Plus as PlusBase, Video } from 'lucide-react'
import { SegmentedButtonDropdown } from './SegmentedButtonDropdown'
import styles from './page.module.scss'
import { useState } from 'react'
import { motion } from 'framer-motion'

const micOptions = [
  'MacBook Pro Microphone (Built in microphone)',
  "Sarah's Airpods",
  'Line in (BlackMagic DeckLink Mini Recorder Audio)',
]
const addMediaOptions = [
  'Presentations',
  'Video storage',
  'Screen share',
  'More',
  // 'Image',
  // 'Extra camera',
  // 'Local video',
  // 'RTMP source',
]

export default function Home() {
  const [lightBackground, setLightBackground] = useState(false)
  const [showVideo, setShowVideo] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

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
        <SegmentedButtonDropdown options={micOptions} asSegmentedButton>
          <ButtonWithToolTip>
            <Mic />
          </ButtonWithToolTip>
        </SegmentedButtonDropdown>
        <SegmentedButtonDropdown options={micOptions} asSegmentedButton>
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

        <SegmentedButtonDropdown
          onOpenChange={setAddOpen}
          options={addMediaOptions}
        >
          <ButtonWithToolTip>
            <Plus animate={{ rotate: addOpen ? -135 : 0 }} />
          </ButtonWithToolTip>
        </SegmentedButtonDropdown>
        <ButtonWithToolTip>
          <Mic />
        </ButtonWithToolTip>
      </div>
    </div>
  )
}

const Plus = motion.create(PlusBase)

{
  /* <MediaSelect options={micOptions}>
  <MediaSelectTrigger>
    <Plus />
  </MediaSelectTrigger>
  <MediaSelectContent>
    {micOptions.map((option) => (
      <MediaSelectItem key={option}>{option}</MediaSelectItem>
    ))}
  </MediaSelectContent>
</MediaSelect> */
}

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
