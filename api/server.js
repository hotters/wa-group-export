const express = require('express');
const { WA } = require('./waa.js');
const qrcode = require('qrcode');
const expressWs = require('express-ws');
const cors = require('cors');

const app = express();
const ews = expressWs(app);
const port = 4000;

function msg(type, payload) {
  return JSON.stringify({ type, payload });
}

const wa = new WA();
app.use(cors());

app.ws('/api', async (ws, req) => {
  ws.send(msg('init', 'init'));
  await wa.init(
    (qr) => {
      qrcode.toBuffer(qr).then((img) => {
        ws.send(img);
      });
    },
    (msgs) => {
      ws.send(msg('messages', msgs));
    },
    (g) => {
      console.log('groups', g);
      ws.send(msg('groups', g));
    }
  );
  // const group = await wa.getGroup('');
  // console.log('GROUP MEMBERS: ', group);
  // ws.send(msg('group', group));
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
