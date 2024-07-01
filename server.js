const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

// Número de Imagens da pasta Maps
var imageId = imgRandom(10);

// Serve os arquivos estáticos (como o HTML do jogo)
app.use(express.static("public"));

// Função geradora de IDs aleatórios
function imgRandom(value) {
  return Math.round(Math.random() * value);
}

// Gerenciar dados dos Jogadores
io.on("connection", (socket) => {
  socket.emit("imageId", imageId);

  socket.on("info", (info) => {
    socket.broadcast.emit("info", info);
  });

  socket.on("victory", (id) => {
    socket.broadcast.emit("victory", id);
    imageId = imgRandom(2);
  });
});

//Iniciar Servidor
server.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});
