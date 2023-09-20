const fs = require('fs');
const path = require('path');
const express = require('express');
const { WA } = require('./wa.js');
const expressWs = require('express-ws');
const cors = require('cors');

const port = 4000;
const statePath = 'baileys_auth_info';
const filePath = './baileys_store.json';

const app = express();
const ews = expressWs(app);
app.use(cors());

const wa = new WA(statePath, filePath);

ews.getWss().on('connection', (e) => {
  console.log('Someone connected');
});

ews.app.ws('/api', async (ws, req) => {
  const onMessage = (type, payload) => {
    ws.send(msg(type, payload));
  };

  console.log('MAX LISTNERS: ', ws.getMaxListeners(), ws.listeners());

  const repeat = async () => {
    const code = await wa.init(onMessage);
    if (code === 515) {
      console.log('\n\n[REPEAT]\n\n');
      return await repeat();
    }
  };

  ws.on('message', async (data) => {
    console.log('\n[server msg]', data);

    if (data === 'init') {
      await repeat();
      ws.send(msg('init'));
    }

    if (data === 'reset') {
      fs.rmSync(path.resolve(statePath), { recursive: true, force: true });
      fs.rmSync(path.resolve(filePath), { force: true });
      ws.send(msg('reset'));
    }

    if (data.startsWith('id')) {
      try {
        const id = data.split(':')[1];
        const group = await wa.getGroup(id);
        ws.send(msg('group', group));
      } catch (e) {
        ws.send(msg('error', e.message));
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

function msg(type, payload = null) {
  return JSON.stringify({ type, payload });
}
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});
