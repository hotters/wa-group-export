import React, { useEffect, useState, useRef } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Container, Button, Image } from 'semantic-ui-react';
import QR from 'qrcode';

export default function App() {
  const [qr, setQr] = useState('');
  const [ws, setWs] = useState();
  const [loading, setLoading] = useState(false);
  const logIn = () => {
    setLoading(true);
    ws.send('init');
  };

  useEffect(() => {
    const webs = new WebSocket('ws://localhost:4000/api');

    webs.onmessage = (e) => {
      if (e.data instanceof Blob) {
        console.log('blob', e.data.toString());
        const imageUrl = URL.createObjectURL(e.data);
        setQr(imageUrl);
        return;
      }

      const msg = JSON.parse(e.data);

      switch (msg.type) {
        case 'init':
          setLoading(false);
          console.log('init', msg);
          break;

        case 'group':
          console.log('group', msg);
          break;

        case 'history':
          console.log('history', msg);
          break;

        default:
          console.log('No handlers for: ', msg);
          break;
      }
    };

    setWs(webs);
  }, []);

  return (
    <Container>
      <Button onClick={logIn} loading={loading}>
        Log In
      </Button>
      <QRCode qr={qr} />
    </Container>
  );
}

function QRCode({ qr }) {
  const ref = useRef(null);

  useEffect(() => {
    if (qr && ref.current) {
      QR.toCanvas(ref.current, qr);
    }
  }, [qr, ref.current]);

  return <canvas ref={ref}></canvas>;
}
