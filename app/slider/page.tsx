import { SliderV2 } from "./SliderV2";

export default function Home() {
  return (
    <div style={{ width: '100%', maxWidth: '20rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SliderV2 />
      <SliderV2 labelSuffix="%" />
    </div>
  );
}
