const path = require('path');
const express = require('express');
const app = express();
const port = 3001;


app.use(express.static(path.join(__dirname, 'public')));

app.get('/qr', (req, res) => {
    req.send('qr');
});

app.get('/groups', (req, res) => {
    req.send('groups');
});

app.get('/groups/:groupId', (req, res) => {
    res.send(req.params.groupId);
});

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
