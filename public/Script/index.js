const time = document.querySelector(".time");
const victoryPage = document.querySelector(".victory");
const container = document.querySelector(".container");
const game = document.querySelector(".game");
const image = document.querySelector(".map");
const redirect = document.querySelector(".redirect");
const navBar = document.querySelector(".nav-bar");
const userName = document.getElementById("username-input");
const userPage = document.querySelector(".user-page");
const winnaar = document.querySelector(".winnaar");
const usernameButton = document.querySelector(".username-button");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const pixel = 22;
let canvasHeight = 0;
var socket = io();

// Cores utilizadas no jogo
let colors = {
  wall: "rgb(0, 0, 0)",
  exit: "#049DD9",
};

// Cores dos jogadores
const playerColors = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FF00FF",
  "#00FFFF",
  "#800000",
  "#008000",
  "#000080",
  "#808080",
  "#FFA500",
  "#8A2BE2",
  "#008080",
];

// Objeto do jogador
let player = {
  x: 1,
  y: 1,
  id: randomNum(100000),
  color: playerColors[randomNum(playerColors.length)],
};

// Inicialização do jogo
init();

// Inicializa o canvas e a imagem do mapa
function init() {
  image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    draw();
  };
  image.src = image.src; // Força o carregamento da imagem, se necessário
}

// Desenha a imagem de fundo, jogador e saída no canvas
function draw() {
  ctx.drawImage(image, 0, 0, image.width, image.height);
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x * pixel, player.y * pixel, pixel, pixel);
  ctx.fillStyle = colors.exit;
  ctx.fillRect(image.width - pixel * 2, image.height - pixel * 2, pixel, pixel);
}

// Função para contar o tempo de jogo
function timer() {
  let timeElapsed = 0;
  setInterval(() => {
    timeElapsed += 1;
    time.innerText = `Tempo: ${timeElapsed}s`;
  }, 1000);
}

// Função executada quando um jogador vence
function victory(id) {
  if (id == player.id) {
    winnaar.innerText = `Você Ganhou!`;
  } else {
    winnaar.innerText = `${id} Ganhou!`;
  }

  victoryPage.style.display = "flex";
  navBar.style.display = "none";

  let timer = 8;
  setInterval(() => {
    redirect.innerText = `A nova partida começará em ${timer} segundos.`;
    timer--;
  }, 1000);

  setTimeout(() => {
    window.location.href = "";
  }, 8300);
}

// Função para renderizar o movimento do jogador
function renderPlayer(position) {
  function isColorAtPosition(x, y, color) {
    return colorPixel(x * pixel, y * pixel) !== color;
  }

  const directionOffsets = {
    Right: { dx: 1, dy: 0 },
    Left: { dx: -1, dy: 0 },
    Up: { dx: 0, dy: -1 },
    Down: { dx: 0, dy: 1 },
  };

  const offset = directionOffsets[position];

  if (
    offset &&
    isColorAtPosition(
      player.x + 0.5 + offset.dx,
      player.y + 0.5 + offset.dy,
      colors.wall
    )
  ) {
    player.x += offset.dx;
    player.y += offset.dy;
    socket.emit("info", player);
  }

  if (
    player.x * pixel == image.width - pixel * 2 &&
    player.y * pixel == image.height - pixel * 2
  ) {
    socket.emit("victory", player.id);
    victory(player.id);
  }

  draw();
}

// Receber Username e iniciar timer
userName.value = localStorage.getItem("name") || "";
usernameButton.addEventListener("click", () => {
  player.id = `${userName.value}${randomNum(100000)}`;
  localStorage.setItem("name", userName.value);
  userPage.style.display = "none";
  navBar.style.display = "flex";
  timer();
});

// Event listeners e outras funções auxiliares
socket.on("imageId", (id) => {
  image.src = `./Game-Images/Maps/map-${id}.png`;
});

socket.on("info", (info) => {
  draw();
  ctx.fillStyle = info.color;
  ctx.fillRect(info.x * pixel, info.y * pixel, pixel, pixel);
});

socket.on("victory", (id) => {
  victory(id);
});

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowRight":
      renderPlayer("Right");
      break;
    case "ArrowLeft":
      renderPlayer("Left");
      break;
    case "ArrowUp":
      renderPlayer("Up");
      break;
    case "ArrowDown":
      renderPlayer("Down");
      break;
    default:
      break;
  }
});

function randomNum(value) {
  return Math.round(Math.random() * value);
}

function colorPixel(x, y) {
  let pixelData = ctx.getImageData(x, y, 1, 1).data;
  return `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
}
