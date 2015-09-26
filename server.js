import express from 'express';

const app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

const port = process.env.PORT || 4500;

const server = app.listen(port, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Ghostwriter listening at http://%s:%s', host, port);
});
