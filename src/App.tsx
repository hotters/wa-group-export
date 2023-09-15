import QR from 'qrcode';
import { useEffect, useMemo, useRef, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Button, Card, Container, Header, List, Table } from 'semantic-ui-react';

export default function App() {
  const [qr, setQr] = useState();
  const [webSocket, setWebSocket] = useState<WebSocket | null>();
  const [loading, setLoading] = useState(null);

  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [participants, setParticipants] = useState();
  const [group, setGroup] = useState();

  const start = () => {
    setLoading(true);
    webSocket.send('init');
  };

  const reset = () => {
    webSocket.send('reset');
    setQr(null);
  };

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000/api');

    ws.addEventListener('open', () => {
      setWebSocket(ws);
      setLoading(false);
    });

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

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
          // setChats((prev) => prev.concat(...msg.payload));
          setChats(msg.payload);
          break;

        case 'contacts':
          setContacts((prev) => prev.concat(...msg.payload));
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
  }, []);

  const onExport = (group) => {
    webSocket.send(`id:${group.id}`);
    setGroup(group);
  };

  return (
    <Container>
      <Container>
        <Button onClick={start} loading={loading} disabled={loading === null}>
          Start
        </Button>
        <Button onClick={reset} disabled={loading === null}>
          Reset
        </Button>
      </Container>
      {qr ? (
        <Card>
          <QRCode qr={qr} />
        </Card>
      ) : null}
      <History chats={chats} onExport={onExport} />
      {participants && group ? (
        <Contacts contacts={contacts} participants={participants} group={group} />
      ) : null}
    </Container>
  );
}

function QRCode({ qr }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current && qr) {
      QR.toCanvas(ref.current, qr);
    }
  }, [qr, ref.current]);

  return <canvas ref={ref} />;
}

function History({ chats, onExport }) {
  const groups = useMemo(() => {
    if (Array.isArray(chats)) {
      return chats.filter((chat) => (chat.id as string).endsWith('g.us'));
    }
    return [];
  }, [chats]);

  const exportContacts = (group) => {
    console.log('Export: ', group);
    onExport(group);
  };

  return (
    <Container>
      <Header as="h3">Groups:</Header>
      <List>
        {groups.map((group) => (
          <List.Item key={group.id}>
            <List.Content>{group.name}</List.Content>
            <Button onClick={() => exportContacts(group)} size="mini">
              Export
            </Button>
          </List.Item>
        ))}
      </List>
    </Container>
  );
}

function Contacts({ contacts, participants, group }) {
  const data = useMemo(() => {
    return participants.map(({ id, admin }) => {
      const contact = contacts?.find((c) => c.id === id);
      return {
        phone: `+${id.split('@')[0]}`,
        contact: contact?.name,
        nick: contact?.notify,
        admin,
      };
    });
  }, [participants, contacts]);

  return (
    <Container>
      <Header as="h3">Contacts:</Header>
      <Table striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Phone</Table.HeaderCell>
            <Table.HeaderCell>Contact</Table.HeaderCell>
            <Table.HeaderCell>Nickname</Table.HeaderCell>
            <Table.HeaderCell>Admin</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((item) => (
            <Table.Row key={item.phone}>
              <Table.Cell>{item.phone}</Table.Cell>
              <Table.Cell>{item.contact}</Table.Cell>
              <Table.Cell>{item.nick}</Table.Cell>
              <Table.Cell>{item.admin}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Button onClick={() => download(data, group.name)}>Download</Button>
    </Container>
  );
}

function download(data: any[], name: string) {
  const csv = data
    .reduce(
      (prev, item) => {
        prev.push(
          Object.values(item)
            .map((value: string) => (value?.includes(',') ? `"${value}"` : value))
            .join(',')
        );
        return prev;
      },
      [{ ...Object.keys(data[0]) }]
    )
    .join('\n');

  const url = window.URL.createObjectURL(new Blob([csv]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${name}.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
}
