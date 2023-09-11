const baileys = require('@whiskeysockets/baileys');
const qrcode = require("qrcode");

async function connectToWhatsApp() {
  const { state, saveCreds } = await baileys.useMultiFileAuthState(
    'baileys_auth_info'
  );
  // fetch latest version of WA Web
  const { version, isLatest } = await baileys.fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const socket = baileys.makeWASocket({
    // can provide additional config here
    // printQRInTerminal: true,
    browser: baileys.Browsers.macOS('Desktop'),
    auth: state,
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !==
        baileys.DisconnectReason.loggedOut;
      console.log(
        'connection closed due to ',
        lastDisconnect.error,
        ', reconnecting ',
        shouldReconnect
      );
      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('opened connection');
    }
  });

  socket.ev.on('messages.upsert', async (m) => {
    console.log(JSON.stringify(m, undefined, 2));

    // console.log('replying to', m.messages[0].key.remoteJid);
    // await sock.sendMessage(m.messages[0].key.remoteJid, {
    //   text: 'Hello there!',
    // });
  });
}
// run in main file
module.export = connectToWhatsApp;
