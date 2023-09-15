const {
  makeWASocket,
  makeInMemoryStore,
  useMultiFileAuthState,
  Browsers,
  DisconnectReason,
  WASocket,
} = require('@whiskeysockets/baileys');

class WA {
  /** @type {WASocket} */
  socket;
  store = makeInMemoryStore({});
  chats = [];
  contacts = [];

  constructor(statePath, filePath) {
    this.statePath = statePath;
    this.filePath = filePath;
  }

  async init(onMessage) {
    const { state, saveCreds } = await useMultiFileAuthState(this.statePath);

    this.socket = makeWASocket({
      browser: Browsers.macOS('Desktop'),
      auth: state,
      syncFullHistory: true,
    });

    this.store.bind(this.socket.ev);

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on('chats.upsert', () => {
      const chats = this.store.chats.all();
      console.log('\n[got chats] ', chats.length);
      // onMessage('chats', chats);
    });

    this.socket.ev.on('contacts.upsert', () => {
      const contacts = Object.values(this.store.contacts);
      console.log('\n[got contacts] ', contacts.length);
      onMessage('contacts', contacts);
    });

    this.socket.ev.on('messaging-history.set', (history) => {
      console.log('\n[got history]', {
        chats: history.chats.length,
        contacts: history.contacts.length,
        messages: history.messages.length,
        isLatest: history.isLatest,
      });
      const { chats, contacts } = history;
      if (chats.length > this.chats.length) {
        this.chats = chats;
        onMessage('chats', this.chats);
        console.log('[sent chats]', this.chats.length);
      }
      if (contacts.length > this.contacts.length) {
        this.contacts = contacts;
        onMessage('contacts', this.contacts);
        console.log('[sent contacts]', this.contacts.length);
      }
    });

    return new Promise((res) => {
      this.socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        console.log(`\nStatus: ${connection}`, update);

        if (qr) {
          onMessage('qr', qr);
        }

        if (connection === 'close') {
          const code = lastDisconnect.error?.output?.statusCode;
          const message = lastDisconnect.error?.message;
          console.log('\nConnection closed! Error: ', code, message);
          onMessage('error', { code, message });
          res(code);
        }

        if (connection === 'open') {
          console.log('\nConnection opened!');
          res();
        }
      });
    });
  }

  async getGroup(id) {
    console.log('[get group]', id);
    return await this.socket.groupMetadata(id);
  }
}

module.exports = { WA: WA };
