import { SliderV2 } from "./SliderV2";

const styles: React.CSSProperties = { width: '100%', maxWidth: '30rem', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }

export default function Home() {
  return (
    <div style={styles}>
      <div style={styles}>
        <SliderV2 />
        <SliderV2 labelSuffix="%" />
      </div>
      <div style={{...styles, background: '#051838'}}>
        <SliderV2 />
        <SliderV2 labelSuffix="%" />
      </div>
    </div>
  );
}

//background: var(--Gray-950, #051838);