const express = require('express');
const { WA } = require('./waa.js');
const expressWs = require('express-ws');
const cors = require('cors');

const port = 4000;

const app = express();
const ews = expressWs(app);
app.use(cors());

const wa = new WA();

app.ws('/api', async (ws, req) => {
  const onMessage = (type, payload) => {
    ws.send(msg(type, payload));
  };
  
  ws.on('message', async (data) => {
    if (data === 'init') {
      await wa.init(onMessage);
      ws.send(msg('init', null));
    }
  });

  // const group = await wa.getGroup('');
  // console.log('GROUP MEMBERS: ', group);
  // ws.send(msg('group', group));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

function msg(type, payload) {
  return JSON.stringify({ type, payload });
}
