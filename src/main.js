import { emojis, maps } from "./maps";

const canvas = document.querySelector("#game");
const game = canvas.getContext("2d");
const buttonUp = document.querySelector("#up");
const buttonLeft = document.querySelector("#left");
const buttonRight = document.querySelector("#right");
const buttonDown = document.querySelector("#down");
const livesSpan = document.querySelector("#lives");
const time = document.querySelector("#time");
const record = document.querySelector("#record");
const result = document.querySelector("#result");

window.addEventListener("load", setCanvasSize);
window.addEventListener("resize", setCanvasSize);

window.addEventListener("keydown", moveByKey);
buttonUp.addEventListener("click", moveUp);
buttonLeft.addEventListener("click", moveLeft);
buttonRight.addEventListener("click", moveRight);
buttonDown.addEventListener("click", moveDown);

let elementSize;
let canvasSize;
let timeStart;
let timeInterval;
let level = 0;
let lives = 3;

const playerPosition = {
  x: undefined,
  y: undefined,
};

const giftPosition = {
  x: undefined,
  y: undefined,
};

let enemyPosition = [];

function setCanvasSize() {
  canvasSize = Math.floor(
    Math.min(window.innerWidth, window.innerHeight) * 0.8
  );

  canvas.setAttribute("width", canvasSize);
  canvas.setAttribute("height", canvasSize);

  elementSize = Math.floor(canvasSize / 10);
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function moveByKey(event) {
  if (event.key === "ArrowUp") moveUp();
  else if (event.key === "ArrowLeft") moveLeft();
  else if (event.key === "ArrowRight") moveRight();
  else if (event.key === "ArrowDown") moveDown();
}

function moveUp() {
  if (playerPosition.y - elementSize < elementSize) return;
  playerPosition.y -= elementSize;
  startGame();
}

function moveLeft() {
  if (playerPosition.x - elementSize < elementSize) return;
  playerPosition.x -= elementSize;
  startGame();
}

function moveRight() {
  if (playerPosition.x + elementSize > canvasSize) return;
  playerPosition.x += elementSize;
  startGame();
}

function moveDown() {
  if (playerPosition.y + elementSize > canvasSize) return;
  playerPosition.y += elementSize;
  startGame();
}

function movePlayer() {
  const giftCollisionX =
    Math.floor(playerPosition.x) === Math.floor(giftPosition.x);
  const giftCollisionY =
    Math.floor(playerPosition.y) === Math.floor(giftPosition.y);
  if (giftCollisionX && giftCollisionY) {
    level++;
    startGame();
  }

  const collision = enemyPosition.find(
    (enemy) =>
      Math.floor(enemy.x) === Math.floor(playerPosition.x) &&
      Math.floor(enemy.y) === Math.floor(playerPosition.y)
  );

  if (collision) levelFail();

  game.fillText(emojis["PLAYER"], playerPosition.x, playerPosition.y);
}

function levelFail() {
  lives--;
  if (lives <= 0) {
    level = 0;
    lives = 3;
    timeStart = undefined;
  }
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function gameWin() {
  const recordTime = localStorage.getItem("recordTime");
  const playerTime = Date.now() - timeStart;

  if (recordTime) {
    if (recordTime >= playerTime) {
      localStorage.setItem("recordTime", playerTime);
      result.innerText = "Ganaste y supero su propio record";
    } else {
      result.innerText = "Ganaste pero no supero su propio record";
    }
  } else {
    localStorage.setItem("recordTime", playerTime);
  }
  clearInterval(timeInterval);
}

function showLives() {
  livesSpan.innerText = Array(lives).fill(emojis.HEART).join("");
}

function showTime() {
  time.innerText = Date.now() - timeStart;
}

function startGame() {
  game.font = elementSize + "px Arial";
  game.textAlign = "end";

  const map = maps[level];

  if (!map) return gameWin();

  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    record.innerText = localStorage.getItem("recordTime");
  }

  const mapRows = map.trim().split("\n");
  const mapRowsCols = mapRows.map((row) => row.trim().split(""));

  showLives();

  enemyPosition = [];
  game.clearRect(0, 0, canvasSize, canvasSize);
  mapRowsCols.forEach((row, ri) =>
    row.forEach((col, ci) => {
      const emoji = emojis[col];
      const x = elementSize * (ci + 1);
      const y = elementSize * (ri + 1);

      if (col === "O" && !playerPosition.x && !playerPosition.y) {
        playerPosition.x = x;
        playerPosition.y = y;
      } else if (col === "I") {
        giftPosition.x = x;
        giftPosition.y = y;
      } else if (col === "X") {
        enemyPosition.push({ x, y });
      }

      game.fillText(emoji, x, y);
    })
  );
  movePlayer();
}
