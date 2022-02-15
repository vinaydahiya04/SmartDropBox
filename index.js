const express = require("express");
const app = express();
const server = require("http").createServer(app);
const WebSocket = require("ws");

const wss = new WebSocket.Server({ server: server });

var box = {
  state: 0,
  weight: 1000,
};

// state : 0 means open 1 means closed
// weight : the reading from sensor

wss.on("connection", function connection(ws) {
  console.log("A new client Connected!");
  ws.send(JSON.stringify(box));

  function update() {
    new_weight = Math.floor(Math.random() * 11);
    box.weight = new_weight;
    ws.send(JSON.stringify(box));
  }

  const updates = setInterval(update, 5000);
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);

    var recstate = JSON.parse(message);

    if (recstate.state !== box.state) {
      console.log("Push data to ESP8266 Module");
      box.state = recstate.state;
    }
    console.log(box);
    ws.send(JSON.stringify(box));

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

app.get("/", (req, res) => res.send("Hello World!"));

server.listen(3000, () => console.log(`Lisening on port :3000`));
