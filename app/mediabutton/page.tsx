'use client'

import { MediaButton } from "./MediaButton";

export default function Home() {
  return (
    <div style={{ maxWidth: '20rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '30rem' }}>
      <MediaButton />
    </div>
  );
}
