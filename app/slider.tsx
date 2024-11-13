import { Root, Track, Range, Thumb } from "@radix-ui/react-slider";
import styles from './slider.module.scss'


const SliderDemo = () => (
  <form>
    <Slider />
  </form>
);

function Slider() {
  return (
    <Root className={styles.Root} defaultValue={[50]} max={100} step={1}>
      <Track className={styles.Track}>
        <Range className={styles.Range} />
      </Track>
      <Thumb className={styles.Thumb} aria-label="Volume" />
    </Root>
  )
}

export default SliderDemo;