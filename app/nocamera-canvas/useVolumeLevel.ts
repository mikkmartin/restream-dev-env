import { MotionValue, useMotionValue } from 'motion/react'
import { useEffect } from 'react'
import * as React from 'react'

export function useVolumeLevel(mediaStream: MediaStream): MotionValue<number> {
  const frameRequestIdRef = React.useRef<number>()
  const volumeLevel = useMotionValue(0)

  useEffect(() => {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(mediaStream)
    source.connect(analyser)
    analyser.fftSize = 256 // Reduced for even faster updates
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateAudioLevel = () => {
      frameRequestIdRef.current = requestAnimationFrame(updateAudioLevel)
      analyser.getByteFrequencyData(dataArray)

      // Focus on mid-range frequencies (approximately 300Hz to 3400Hz)
      const midRangeStart = Math.floor(
        (300 * bufferLength) / audioContext.sampleRate,
      )
      const midRangeEnd = Math.ceil(
        (3400 * bufferLength) / audioContext.sampleRate,
      )

      let midRangeSum = 0
      let totalSum = 0

      for (let i = 0; i < bufferLength; i++) {
        if (i >= midRangeStart && i <= midRangeEnd) {
          midRangeSum += (dataArray[i] ?? 0) * 10 // Triple the weight for mid-range
        }
        totalSum += dataArray[i] ?? 0
      }

      const weightedAverage =
        (midRangeSum + totalSum) /
        (bufferLength + (midRangeEnd - midRangeStart + 1) * 2)

      const threshold = 100 // Adjust this value to change the low volume cutoff
      let scaledLevel = 0
      if (weightedAverage > threshold) {
        scaledLevel = (weightedAverage - threshold) / (255 - threshold)
      }

      // Add a small baseline value when audio is detected
      const clippedLevel = Math.min(1, scaledLevel)

      volumeLevel.set(clippedLevel)
    }

    updateAudioLevel()

    return () => {
      if (!frameRequestIdRef.current) return
      cancelAnimationFrame(frameRequestIdRef.current)
    }
  }, [mediaStream])

  return volumeLevel
}
