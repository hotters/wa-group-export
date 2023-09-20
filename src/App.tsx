import { useState } from 'react';
import { Button, Card, Container } from 'semantic-ui-react';
import { Contacts, History, QRCode } from './components';
import { WsMessage } from './types';

export default function App() {
  const [qr, setQr] = useState();
  const [webSocket, setWebSocket] = useState<WebSocket | null>();
  const [loading, setLoading] = useState(false);

  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState({});

  const [participants, setParticipants] = useState();
  const [group, setGroup] = useState();

  const start = () => {
    setLoading(true);
    const ws = new WebSocket('ws://localhost:4000/api');

    console.log('ws readyState', ws.readyState);

    ws.onopen = () => {
      setWebSocket(ws);
      ws.send('init');
    };

    ws.onmessage = (e) => {
      const msg: WsMessage = JSON.parse(e.data);

      console.log(`[${msg.type}]`, msg.payload);

      switch (msg.type) {
        case 'qr':
          setQr(msg.payload);
          break;

        case 'init':
          break;

        case 'group':
          setParticipants(msg.payload?.participants);
          break;

        case 'chats':
          setChats(msg.payload);
          break;

        case 'contacts':
          const newContacts = { ...contacts };
          msg.payload.forEach((contact) => (newContacts[contact.id] = contact));
          setContacts(newContacts);
          break;

        case 'history':
          if (msg.payload.isLatest) {
            setChats(msg.payload.chats);
            setContacts(msg.payload.contacts);
          }
          break;

        case 'error':
          setQr(null);
          break;

        case 'reset':
          break;

        default:
          console.log('No handlers for: ', msg.type);
          break;
      }

      setLoading(false);
    };
  };

  const reset = () => {
    webSocket.send('reset');
    webSocket.close();
    setQr(null);
    setWebSocket(null);
  };

  const onExport = (group) => {
    webSocket.send(`id:${group.id}`);
    setGroup(group);
  };

  return (
    <Container>
      <Container>
        <Button onClick={start} loading={loading} disabled={loading}>
          Start
        </Button>
        <Button onClick={reset} disabled={!webSocket}>
          Reset
        </Button>
      </Container>
      {qr ? (
        <Card>
          <QRCode qr={qr} />
        </Card>
      ) : null}
      <Container>
        <History chats={chats} onExport={onExport} />
        {participants && group ? (
          <Contacts
            contacts={contacts}
            participants={participants}
            group={group}
          />
        ) : null}
      </Container>
    </Container>
  );
}
