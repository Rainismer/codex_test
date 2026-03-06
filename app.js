(function () {
  "use strict";

  var GRID_ROWS = 20;
  var GRID_COLS = 20;
  var TICK_MS = 150;

  var boardEl = document.getElementById("board");
  var scoreEl = document.getElementById("score");
  var statusEl = document.getElementById("status");
  var pauseBtn = document.getElementById("pauseBtn");
  var restartBtn = document.getElementById("restartBtn");
  var directionButtons = document.querySelectorAll("[data-direction]");

  var state = SnakeLogic.createInitialState({ rows: GRID_ROWS, cols: GRID_COLS });
  var cells = [];

  function keyToDirection(event) {
    var key = event.key.toLowerCase();
    if (event.key === "ArrowUp" || key === "w") {
      return "up";
    }
    if (event.key === "ArrowDown" || key === "s") {
      return "down";
    }
    if (event.key === "ArrowLeft" || key === "a") {
      return "left";
    }
    if (event.key === "ArrowRight" || key === "d") {
      return "right";
    }

    return null;
  }

  function toIndex(x, y) {
    return y * state.cols + x;
  }

  function buildBoard() {
    var fragment = document.createDocumentFragment();
    var total = state.rows * state.cols;
    var i;

    boardEl.style.gridTemplateColumns = "repeat(" + state.cols + ", 1fr)";
    boardEl.innerHTML = "";
    cells = [];

    for (i = 0; i < total; i += 1) {
      var cell = document.createElement("div");
      cell.className = "cell";
      cells.push(cell);
      fragment.appendChild(cell);
    }

    boardEl.appendChild(fragment);
  }

  function updateHud() {
    scoreEl.textContent = String(state.score);

    if (state.gameOver) {
      statusEl.textContent = "游戏结束";
      pauseBtn.disabled = true;
      pauseBtn.textContent = "暂停";
      return;
    }

    pauseBtn.disabled = false;
    if (state.paused) {
      statusEl.textContent = "已暂停";
      pauseBtn.textContent = "继续";
    } else {
      statusEl.textContent = "进行中";
      pauseBtn.textContent = "暂停";
    }
  }

  function render() {
    var i;

    for (i = 0; i < cells.length; i += 1) {
      cells[i].className = "cell";
    }

    for (i = 0; i < state.snake.length; i += 1) {
      var part = state.snake[i];
      var index = toIndex(part.x, part.y);
      if (cells[index]) {
        cells[index].classList.add("snake");
      }
    }

    var head = state.snake[0];
    var headIndex = toIndex(head.x, head.y);
    if (cells[headIndex]) {
      cells[headIndex].classList.add("head");
    }

    if (state.food) {
      var foodIndex = toIndex(state.food.x, state.food.y);
      if (cells[foodIndex]) {
        cells[foodIndex].classList.add("food");
      }
    }

    updateHud();
  }

  function setDirection(direction) {
    state = SnakeLogic.withDirection(state, direction);
    render();
  }

  function restart() {
    state = SnakeLogic.restartGame(state);
    render();
  }

  function togglePause() {
    state = SnakeLogic.togglePause(state);
    render();
  }

  function onKeyDown(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(event.key) >= 0) {
      event.preventDefault();
    }

    var direction = keyToDirection(event);
    if (direction) {
      setDirection(direction);
      return;
    }

    var key = event.key.toLowerCase();
    if (key === "r") {
      restart();
      return;
    }

    if (event.key === " " || key === "p") {
      togglePause();
    }
  }

  function onDirectionButtonClick(event) {
    var direction = event.currentTarget.getAttribute("data-direction");
    if (direction) {
      setDirection(direction);
    }
  }

  function startLoop() {
    window.setInterval(function () {
      state = SnakeLogic.tick(state);
      render();
    }, TICK_MS);
  }

  directionButtons.forEach(function (button) {
    button.addEventListener("click", onDirectionButtonClick);
  });
  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", restart);
  window.addEventListener("keydown", onKeyDown, { passive: false });

  buildBoard();
  render();
  startLoop();
})();
