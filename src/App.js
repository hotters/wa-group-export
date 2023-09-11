import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Container, Button, Image } from 'semantic-ui-react';

export default function App() {
  const [qr, setQr] = useState('');
  const [ws, setWs] = useState();
  const [loading, setLoading] = useState(false);
  const logIn = () => {
    setLoading(true);
    fetch('/api/qr')
      .then((res) => res.blob())
      .then((res) => {
        setQr(URL.createObjectURL(res));
        setLoading(false);
      });
  };

  useEffect(() => {
    const webs = new WebSocket('ws://localhost:4000/api');
    
    webs.onmessage = (e) => {
      if (e.data instanceof Blob) {
        console.log('blob', e.data.toString())
        const imageUrl = URL.createObjectURL(e.data);
        setQr(imageUrl)
        return;
      }

      const data = JSON.parse(e.data);

      switch (data.type) {
        case 'group':
          console.log('group', data);
          break;
        case 'groups':
          console.log('groups', data);
          break;
        case 'messages':
          console.log('messages', data);
          // setQr(data.payload);
          break;

        default:
          console.log('No handlers for: ', data);
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
      {qr && <Image src={qr} />}
    </Container>
  );
}
