const app = require('express')();
const http = require('http').Server(app);
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const _ = require('lodash');
const io = require('socket.io')(http);

let registeredUser;
const isRunningUser = [];

fs.readFile('registered-user.json').then((data) => {
  registeredUser = JSON.parse(data);
}).catch(() => {
  fs.writeFile('registered-user.json', JSON.stringify([]));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.route('/')
  .get((req, res) => {
    res.json(registeredUser);
  })
  .post((req, res) => {
    const { userId } = req.body;
    registeredUser.push({ userId });
    fs.writeFile('registered-user.json', JSON.stringify(registeredUser));
    res.json({ done: true });
  })
  .delete((req, res) => {
    const { userId } = req.body;
    _.remove(registeredUser, e => e.userId === userId);
    fs.writeFile('registered-user.json', JSON.stringify(registeredUser));
    res.json({ done: true });
  });

// Check the user is running the bot

io.on('connection', (socket) => {
  socket.on('activate:bot', (msg) => {
    // eslint-disable-next-line no-param-reassign
    socket.username = msg;

    if (isRunningUser.indexOf(socket) === -1) {
      isRunningUser.push(msg);
      io.emit('should:activate', true);
    }
    console.log(isRunningUser);
  });

  socket.on('disconnect', () => {
    isRunningUser.splice(isRunningUser.indexOf(socket.username), 1);
    console.log(isRunningUser);
  });
});

http.listen(3000, () => {
  console.log('App listening on port 3000!');
});
