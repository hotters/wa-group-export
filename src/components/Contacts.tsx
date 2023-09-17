import { useMemo } from 'react';
import { Button, Container, Header, Table } from 'semantic-ui-react';
import { downloadGroup } from '../utils';

export default function Contacts({ contacts, participants, group }) {
  const data = useMemo(() => {
    return participants.map(({ id, admin }) => {
      const contact = Object.values<{ id; name }>(contacts)?.find((c) => c.id === id);
      return {
        phone: `+${id.split('@')[0]}`,
        name: contact?.name,
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
      <Button onClick={() => downloadGroup(data, group.name)}>Download</Button>
    </Container>
  );
}
