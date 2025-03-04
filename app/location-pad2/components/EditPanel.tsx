'use client'

import { useAtom } from 'jotai'
import styles from '../page.module.scss'
import { shapes } from '../types'
import {
  scaleAtom,
  paddingAtom,
  selectedShapeAtom,
  multipleElementsAtom,
  debugModeAtom,
  isDraggingAtom,
  isCommandPressedAtom,
} from '../atoms'
import { motion } from 'motion/react'

export function EditPanel() {
  const [scale, setScale] = useAtom(scaleAtom)
  const [padding, setPadding] = useAtom(paddingAtom)
  const [selectedShape, setSelectedShape] = useAtom(selectedShapeAtom)
  const [multipleElements, setMultipleElements] = useAtom(multipleElementsAtom)
  const [debugMode, setDebugMode] = useAtom(debugModeAtom)
  const [isDragging] = useAtom(isDraggingAtom)
  const [isCommandPressed] = useAtom(isCommandPressedAtom)

  return (
    <div>
      {/* Shape selection radio inputs */}
      <div className={styles.shapeSelector}>
        <p>Shape:</p>
        <div className={styles.radioGroup}>
          {shapes.map((shape) => (
            <label
              className={styles.radioLabel}
              data-disabled={multipleElements}
              key={shape}
            >
              <input
                type="radio"
                name="shape"
                disabled={multipleElements}
                value={shape}
                checked={selectedShape === shape}
                onChange={() => setSelectedShape(shape)}
              />
              {shape}
            </label>
          ))}
        </div>
      </div>

      {/* Padding slider */}
      <div className={styles.scaleControl}>
        <p>Padding: {padding.toFixed(2)}</p>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            className={styles.slider}
            value={padding}
            onChange={(e) => setPadding(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Scale slider */}
      <div className={styles.scaleControl}>
        <p>Scale: {scale.toFixed(2)}</p>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0.4"
            max="3"
            step="0.01"
            className={styles.slider}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Multiple elements */}
      <div className={styles.multipleElements}>
        <input
          type="checkbox"
          id="multipleElements"
          checked={multipleElements}
          onChange={(e) => {
            const checked = e.target.checked
            setMultipleElements(checked)
            if (checked) {
              setSelectedShape('landscape')
            }
          }}
        />
        <label htmlFor="multipleElements">Multiple elements</label>
      </div>

      {/* Debug mode */}
      <div className={styles.multipleElements}>
        <input
          type="checkbox"
          id="debugMode"
          checked={debugMode}
          onChange={(e) => setDebugMode(e.target.checked)}
        />
        <label htmlFor="debugMode">Debug mode</label>
      </div>

      {/* Pad instructions */}
      <div className={styles.instructions}>
        <motion.p animate={{ opacity: isDragging ? 1 : 0 }}>
          Hold ⌘ Command for precise movement.
        </motion.p>
        <motion.p animate={{ opacity: isCommandPressed ? 1 : 0 }}>
          Holding Command.
        </motion.p>
      </div>
    </div>
  )
}
