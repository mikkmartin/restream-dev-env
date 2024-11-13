import { Root, Track, Range, Thumb } from "@radix-ui/react-slider";
import styles from './slider.module.scss'

const SliderDemo = () => (
  <form>
    <Slider />
  </form>
);

type SliderProps = {
  defaultValue?: number
  max?: number
  step?: number
}

function Slider({ defaultValue, max, step }: SliderProps) {
  return (
    <Root className={styles.Root}
      defaultValue={[defaultValue || 50]}
      max={max || 100}
      step={step || 1}
    >
      <Track className={styles.Track}>
        <Range className={styles.Range} />
      </Track>
      <Thumb className={styles.Thumb} aria-label="Volume" />
    </Root>
  )
}

export default SliderDemo;