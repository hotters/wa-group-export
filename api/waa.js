const {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
  DisconnectReason,
  WASocket,
} = require('@whiskeysockets/baileys');

class WA {
  /** @type {WASocket} */
  socket;

  async init(onMessage) {
    const { state, saveCreds } = await useMultiFileAuthState(
      'baileys_auth_info'
    );

    this.socket = makeWASocket({
      browser: Browsers.macOS('Desktop'),
      auth: state,
    });

    return new Promise((res, rej) => {
      this.socket.ev.on('creds.update', saveCreds);

      this.socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        console.log(`\nStatus: ${connection}`, update);

        if (qr) {
          onMessage('qr', qr);
        }

        if (connection === 'close') {
          console.log('\nConnection closed. Error: ', lastDisconnect.error);
          rej();
        } 
        
        if (connection === 'open') {
          console.log('\nConnection opened!');
          res();
        }
      });

      this.socket.ev.on('messaging-history.set', async (history) => {
        onMessage('history', history);
      });
    });
  }

  async getGroup(id) {
    return await this.socket.groupMetadata(id);
  }
}

module.exports = { WA: WA };
