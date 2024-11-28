'use client'

import { AnimatePresence, motion, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useAudioRecorder } from 'react-audio-voice-recorder'

const snappy = { type: 'spring', stiffness: 150, damping: 15 }

export default function AudioGain() {
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
    null,
  )
  //   const { startRecording, mediaRecorder, stopRecording } = useAudioRecorder()

  return (
    <div>
      <p>Audio Gain</p>
      {/* <MicrophonePane /> */}
    </div>
  )
}

// function MicrophonePane() {
//   const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([])
//   const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
//     null,
//   )
//   const [selectionOpen, setSelectionOpen] = useState(false)
//   const { startRecording, mediaRecorder, stopRecording } = useAudioRecorder({
//     deviceId: selectedDevice?.deviceId,
//   })
//   const [audioMuted, setAudioMuted] = useState(false)

//   useEffect(() => {
//     navigator.mediaDevices.enumerateDevices().then((devices) => {
//       const videoDevices = devices.filter(
//         ({ kind }: { kind: string }) => kind === 'audioinput',
//       )
//       setAudioInputs(videoDevices)
//       !selectedDevice && setSelectedDevice(videoDevices[0])
//     })
//   }, [setAudioInputs])

//   const audioLevel = useSpring(0, snappy)
//   const animationRef = useRef<number>()
//   const didCaptureAudio = useRef(false)

//   useEffect(() => {
//     if (!mediaRecorder) return
//     const audioContext = new AudioContext()
//     const analyser = audioContext.createAnalyser()
//     const source = audioContext.createMediaStreamSource(mediaRecorder.stream)
//     source.connect(analyser)
//     analyser.fftSize = 256 // Reduced for even faster updates
//     const bufferLength = analyser.frequencyBinCount
//     const dataArray = new Uint8Array(bufferLength)

//     const updateAudioLevel = () => {
//       animationRef.current = requestAnimationFrame(updateAudioLevel)
//       analyser.getByteFrequencyData(dataArray)

//       // Focus on mid-range frequencies (approximately 300Hz to 3400Hz)
//       const midRangeStart = Math.floor(
//         (300 * bufferLength) / audioContext.sampleRate,
//       )
//       const midRangeEnd = Math.ceil(
//         (3400 * bufferLength) / audioContext.sampleRate,
//       )

//       let midRangeSum = 0
//       let totalSum = 0

//       for (let i = 0; i < bufferLength; i++) {
//         if (i >= midRangeStart && i <= midRangeEnd) {
//           midRangeSum += dataArray[i] * 10 // Triple the weight for mid-range
//         }
//         totalSum += dataArray[i]
//       }

//       const weightedAverage =
//         (midRangeSum + totalSum) /
//         (bufferLength + (midRangeEnd - midRangeStart + 1) * 2)

//       // Apply a more aggressive non-linear scaling with a threshold
//       const threshold = 1 // Adjust this value to change the low volume cutoff
//       let scaledLevel = 0
//       if (weightedAverage > threshold) {
//         scaledLevel = Math.pow(
//           (weightedAverage - threshold) / (255 - threshold),
//           0.6,
//         )
//       }

//       if (scaledLevel > 0.01) didCaptureAudio.current = true

//       // Add a small baseline value when audio is detected
//       scaledLevel += didCaptureAudio.current ? 0.015 : 0

//       if (!audioMuted) audioLevel.set(scaledLevel)
//     }

//     updateAudioLevel()

//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current)
//       }
//     }
//   }, [mediaRecorder, selectedDevice, audioMuted])

//   useEffect(() => {
//     startRecording()
//     return () => {
//       stopRecording()
//       audioLevel.set(0)
//     }
//   }, [mediaRecorder, selectedDevice])

//   useEffect(() => {
//     audioLevel.set(0)
//   }, [audioMuted])

//   return (
//     <div>
//       <p>Microphone</p>
//     </div>
//   )
// }
