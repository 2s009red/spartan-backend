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
  // TODO extension really evaluates to 0 = 90, 1 = 180
  extension: 1, // TODO ranges from ~90 to 180? can change this range
  frequency: 0,	// TODO range from 0 to 1
}

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  sockets.push(socket);
  socket.send(`e${Math.floor(spartanConfig.extension * 90 + 90)}`);
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
      console.log(`sent: ${message}`);
      socket.send(message);
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

app.post('/command', (req, res) => {
  if ('command' in req.body) {
    broadcast(`${req.body.command}`);
  }

  res.status(200).end();
})

app.get('/docombo', (req, res) => {
  broadcast(`r`);

  broadcast(`c000000 180`);
  broadcast(`c000400 0`);

  broadcast(`c002000 180`);
  broadcast(`c002200 0`);

  broadcast(`c004000 100`);
  broadcast(`c004200 0`);

  broadcast(`c006000 180`);
  broadcast(`c006400 0`);

  broadcast(`c008000 180`);
  broadcast(`c008200 0`);

  broadcast(`c010000 100`);
  broadcast(`c010200 0`);

  res.status(200).end();
})

app.get('/feint', (req, res) => {
  broadcast(`r`);

  broadcast(`c000000 60`);
  broadcast(`c000200 0`);

  res.status(200).end();
})

app.get('/doublepunch', (req, res) => {
  broadcast(`r`);

  broadcast(`c000000 180`);
  broadcast(`c000200 0`);

  broadcast(`c000600 180`);
  broadcast(`c000800 0`);

  res.status(200).end();
})

app.post('/threshold', (req, res) => {
  if ('threshold' in req.body) {
    broadcast(`d${req.body.threshold}`);
  }

  res.status(200).end();
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
  // TODO redo these constants, lol
  broadcast(`e${Math.floor(spartanConfig.extension * 90 + 90)}`);
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

// for JT
app.use(express.static('static'))
