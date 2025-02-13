import { CSSProperties } from 'react'
import * as React from 'react'
import { CanvasCameraPlaceholderDrawer } from './CanvasCameraPlaceholderDrawer'

const fontUrl =
  'https://fonts.gstatic.com/s/montserrat/v29/JTUSjIg1_i6t8kCHKm459WRhyyTh89ZNpQ.woff2'

import {
  motion,
  useAnimationFrame,
  useSpring,
  useTransform,
} from 'motion/react'
import { useVolumeLevel } from './useVolumeLevel'

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720
const SNAPPY_SPRING = {
  type: 'spring',
  stiffness: 1200,
  damping: 50,
  mass: 0.1,
}

const COLOR_OPTIONS = {
  '32D4E6': '#32D4E6',
  '32E659': '#32E659',
  '32E6C8': '#32E6C8',
  E63232: '#E63232',
  E67132: '#E67132',
  E6B932: '#E6B932',
}

interface Props {
  readonly style?: CSSProperties
  readonly mediaStream: MediaStream
  readonly className?: string
  readonly sourceClassName?: string
}

const IMAGE_URL =
  'https://lh3.googleusercontent.com/ogw/AF2bZyiPrpv3q9AdGsl2HH-nItmgQxyN3ICTZ1LaDk0EHJM1A-Tv'

export const CameraPlaceholder: React.FC<Props> = ({
  style,
  mediaStream,
  className = '',
  sourceClassName = '',
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const drawerRef = React.useRef<CanvasCameraPlaceholderDrawer | null>(null)
  const mouseDownRef = React.useRef(false)
  const [text, setText] = React.useState('MM')
  const [showAvatar, setShowAvatar] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState(IMAGE_URL)
  const [colors, setColors] = React.useState<[string, string]>([
    '#006eff',
    '#ffffff',
  ])

  const volumeLevel = useVolumeLevel(mediaStream)
  const textSize = useSpring(0, SNAPPY_SPRING)
  const circleSizeInner = useSpring(textSize, { ...SNAPPY_SPRING })
  const circleSize = useSpring(circleSizeInner, {
    ...SNAPPY_SPRING,
    stiffness: 400,
  })

  volumeLevel.onChange((level) => {
    if (mouseDownRef.current) return
    textSize.set(level)
  })

  useAnimationFrame(() => {
    if (!drawerRef.current) return
    drawerRef.current.setTextProgress(textSize.get())
    drawerRef.current.setCircleSizeInner(circleSizeInner.get())
    drawerRef.current.setCircleProgress(circleSize.get())
    drawerRef.current.renderFrame()
  })

  React.useLayoutEffect(() => {
    const font = new FontFace('Montserrat', `url(${fontUrl})`)
    font
      .load()
      .then(() => {
        document.fonts.add(font)
        drawerRef.current = new CanvasCameraPlaceholderDrawer(
          canvasRef.current!,
          {
            avatarUrl: showAvatar ? avatarUrl : '',
            colors,
            text,
          },
        )
      })
      .catch((e) => {
        console.error(e)
      })
  }, [canvasRef, showAvatar, avatarUrl])

  function debugVolume(ev: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawerRef.current) return
    const { clientWidth } = ev.currentTarget
    const x = ev.nativeEvent.offsetX / clientWidth
    textSize.set(x)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
      if (drawerRef.current) {
        drawerRef.current.setAvatarUrl(url)
      }
      setShowAvatar(true)
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 16,
          flexDirection: 'column',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="showAvatar"
              checked={showAvatar}
              onChange={(ev) => {
                setShowAvatar(ev.target.checked)
                if (drawerRef.current) {
                  drawerRef.current.setAvatarUrl(
                    ev.target.checked ? avatarUrl : '',
                  )
                }
              }}
            />
            <label htmlFor="showAvatar">Show Avatar</label>
          </div>

          {showAvatar && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
              <img style={{ width: '60px' }} src={avatarUrl} />
            </div>
          )}
        </div>

        {!showAvatar && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>Select primary color:</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {Object.entries(COLOR_OPTIONS).map(([key, value]) => (
                  <label
                    key={key}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <input
                      type="radio"
                      name="primaryColor"
                      value={value}
                      checked={colors[0] === value}
                      onChange={(ev) => {
                        const newColor = ev.target.value
                        setColors([newColor, colors[1]])
                        if (drawerRef.current) {
                          drawerRef.current.setColor(newColor, 'A')
                        }
                      }}
                    />
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: value,
                        borderRadius: 4,
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={text}
              onChange={(ev) => {
                setText(ev.target.value)
                if (drawerRef.current)
                  drawerRef.current.setTextValue(ev.target.value)
              }}
            />
          </>
        )}
      </div>
      <motion.div
        style={{
          width: useTransform(volumeLevel, (v) => `${v * 100}%`),
          backgroundColor: 'white',
          height: 8,
        }}
      />
      <motion.div
        style={{
          width: useTransform(textSize, (v) => `${v * 100}%`),
          backgroundColor: 'red',
          height: 8,
        }}
      />
      <motion.div
        style={{
          width: useTransform(circleSizeInner, (v) => `${v * 100}%`),
          backgroundColor: 'green',
          height: 8,
        }}
      />
      <motion.div
        style={{
          width: useTransform(circleSize, (v) => `${v * 100}%`),
          backgroundColor: 'blue',
          height: 8,
        }}
      />
      <canvas
        onPointerDown={(ev) => {
          mouseDownRef.current = true
          debugVolume(ev)
        }}
        onPointerUp={() => {
          mouseDownRef.current = false
          textSize.set(0)
        }}
        onPointerMove={(ev) => {
          if (!mouseDownRef.current) return
          debugVolume(ev)
        }}
        className={sourceClassName}
        style={{ ...style, width: '100%', backgroundColor: 'black' }}
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
    </div>
  )
}
