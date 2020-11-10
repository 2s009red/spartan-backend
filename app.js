const bodyParser = require('body-parser');
const express = require('express')
const ws = require('ws');
const _ = require('lodash');

const app = express()
app.use(bodyParser.json());

const PORT = 80

const sockets = [];

let spartanConfig = {
  speed: 1,    // TODO idk what to make the default speed; change this later
  extension: 180, // TODO ranges from ~90 to 180? can change this range
  frequency: 0,	// TODO range from 0 to 1
}

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  sockets.push(socket);
  socket.send(`e${Math.floor(spartanConfig.extension)}`);
  socket.send(`fn${Math.floor(2000 - 1500 * spartanConfig.frequency)}`);
  socket.send(`fx${Math.floor(4000 - 2000 * spartanConfig.frequency)}`);
  socket.send(`s${spartanConfig.speed}`);
});

const broadcast = (message) => {
  for (socket of sockets) {
    if (socket.readyState == ws.CLOSED) {
    // TODO remove websocket
  //    console.log('closed')
    } else {
      socket.send(message);
      console.log(message);
    }
  }
}

app.get('/punch', (req, res) => {
  console.log('punch');
  res.send('Hello World!')

  broadcast('punch');

  res.status(200).end();
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/spar', (req, res) => {
  if ('spar' in req.body) {
    broadcast(req.body.spar ? '1' : '0');
  }

  res.status(200).end();
})

app.get('/extend', (req, res) => {
  broadcast('2');
  res.status(200).end();
});

app.get('/noextend', (req, res) => {
  broadcast('3');
  res.status(200).end();
});

app.post('/sparring-config', (req, res) => {
  _.assignIn(spartanConfig, req.body);

  // this is pretty terrible
  broadcast(`e${Math.floor(spartanConfig.extension)}`);
  broadcast(`fn${Math.floor(2000 - 1500 * spartanConfig.frequency)}`);
  broadcast(`fx${Math.floor(4000 - 2000 * spartanConfig.frequency)}`);
  broadcast(`s${spartanConfig.speed}`);

  res.status(200).end();
})

const server = app.listen(PORT, () => {
  console.log(`Spartan running on port ${PORT}`)
})

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

