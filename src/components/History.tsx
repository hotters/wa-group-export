import { useMemo } from 'react';
import { Button, Container, Header, List } from 'semantic-ui-react';

export default function History({ chats, onExport }) {
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
