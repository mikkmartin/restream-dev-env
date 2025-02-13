'use client'

import React, { useEffect, useState } from 'react'
import { CameraPlaceholder } from './Canvas'

export default function App() {
  const mediaStreamRef = React.useRef<MediaStream | null>(null)
  const [render, setRender] = useState(false)

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const audioInputs = devices.filter(
          (device) => device.kind === 'audioinput',
        )
        console.log('Available audio inputs:', audioInputs)

        // Try to find MacBook Pro microphone first
        const macbookMic = audioInputs.find((device) =>
          device.label.includes('MacBook Pro'),
        )
        // Fall back to second device if available, otherwise first
        const deviceToUse =
          macbookMic ||
          (audioInputs.length > 1 ? audioInputs[1] : audioInputs[0])

        return navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceToUse.deviceId } },
        })
      })
      .then((stream) => {
        mediaStreamRef.current = stream
        setRender(true)
      })
      .catch((error) => {
        console.error('Error accessing audio:', error)
      })
  }, [])

  if (!render) return null
  return <CameraPlaceholder mediaStream={mediaStreamRef.current!} />
}
