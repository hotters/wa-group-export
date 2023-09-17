import qrcode from 'qrcode';
import { useEffect, useRef } from 'react';

export default function QRCode({ qr }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current && qr) {
      qrcode.toCanvas(ref.current, qr);
    }
  }, [qr, ref.current]);

  return <canvas ref={ref} />;
}
