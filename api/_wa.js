import { useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket, Browsers, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from "qrcode";

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(
    'baileys_auth_info'
  );
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const socket = makeWASocket({
    // can provide additional config here
    // printQRInTerminal: true,
    browser: Browsers.macOS('Desktop'),
    auth: state,
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('QR ===> ', qr);
      qrcode.toBuffer(qr).then(img => console.log(img))
    }
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
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
connectToWhatsApp()