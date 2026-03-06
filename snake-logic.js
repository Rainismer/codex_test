(function (root) {
  "use strict";

  var DIRECTIONS = Object.freeze({
    up: Object.freeze({ x: 0, y: -1 }),
    down: Object.freeze({ x: 0, y: 1 }),
    left: Object.freeze({ x: -1, y: 0 }),
    right: Object.freeze({ x: 1, y: 0 })
  });

  var OPPOSITE = Object.freeze({
    up: "down",
    down: "up",
    left: "right",
    right: "left"
  });

  function sanitizeSize(value, fallback) {
    var parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return fallback;
    }

    return parsed;
  }

  function clonePoint(point) {
    return { x: point.x, y: point.y };
  }

  function pointsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function buildInitialSnake(rows, cols) {
    var length = Math.max(1, Math.min(3, cols));
    var y = Math.floor(rows / 2);
    var headX = Math.floor(cols / 2);
    var snake = [];
    var i;

    for (i = 0; i < length; i += 1) {
      snake.push({ x: headX - i, y: y });
    }

    while (snake[snake.length - 1].x < 0) {
      for (i = 0; i < snake.length; i += 1) {
        snake[i].x += 1;
      }
    }

    return snake;
  }

  function getFreeCells(rows, cols, snake) {
    var occupied = new Set();
    var free = [];
    var x;
    var y;
    var i;

    for (i = 0; i < snake.length; i += 1) {
      occupied.add(snake[i].x + ":" + snake[i].y);
    }

    for (y = 0; y < rows; y += 1) {
      for (x = 0; x < cols; x += 1) {
        if (!occupied.has(x + ":" + y)) {
          free.push({ x: x, y: y });
        }
      }
    }

    return free;
  }

  function getRandomIndex(length, randomFn) {
    if (length <= 1) {
      return 0;
    }

    var n = Math.floor(randomFn() * length);
    if (n < 0) {
      return 0;
    }
    if (n >= length) {
      return length - 1;
    }
    return n;
  }

  function generateFood(rows, cols, snake, randomFn) {
    var free = getFreeCells(rows, cols, snake);
    if (free.length === 0) {
      return null;
    }

    var index = getRandomIndex(free.length, randomFn || Math.random);
    return free[index];
  }

  function createInitialState(options) {
    var settings = options || {};
    var rows = sanitizeSize(settings.rows, 20);
    var cols = sanitizeSize(settings.cols, 20);
    var randomFn = settings.randomFn || Math.random;
    var snake = buildInitialSnake(rows, cols);

    return {
      rows: rows,
      cols: cols,
      snake: snake,
      direction: "right",
      pendingDirection: "right",
      food: generateFood(rows, cols, snake, randomFn),
      score: 0,
      gameOver: false,
      paused: false
    };
  }

  function isOutOfBounds(point, rows, cols) {
    return point.x < 0 || point.y < 0 || point.x >= cols || point.y >= rows;
  }

  function isOnSnake(point, snake) {
    var i;
    for (i = 0; i < snake.length; i += 1) {
      if (pointsEqual(point, snake[i])) {
        return true;
      }
    }

    return false;
  }

  function withDirection(state, nextDirection) {
    if (!DIRECTIONS[nextDirection] || state.gameOver) {
      return state;
    }

    var basis = state.pendingDirection || state.direction;
    if (state.snake.length > 1 && OPPOSITE[basis] === nextDirection) {
      return state;
    }

    if (basis === nextDirection) {
      return state;
    }

    return {
      rows: state.rows,
      cols: state.cols,
      snake: state.snake.map(clonePoint),
      direction: state.direction,
      pendingDirection: nextDirection,
      food: state.food ? clonePoint(state.food) : null,
      score: state.score,
      gameOver: state.gameOver,
      paused: state.paused
    };
  }

  function tick(state, randomFn) {
    if (state.gameOver || state.paused) {
      return {
        rows: state.rows,
        cols: state.cols,
        snake: state.snake.map(clonePoint),
        direction: state.direction,
        pendingDirection: state.pendingDirection,
        food: state.food ? clonePoint(state.food) : null,
        score: state.score,
        gameOver: state.gameOver,
        paused: state.paused
      };
    }

    var rng = randomFn || Math.random;
    var direction = state.pendingDirection || state.direction;
    var delta = DIRECTIONS[direction] || DIRECTIONS.right;
    var head = state.snake[0];
    var nextHead = {
      x: head.x + delta.x,
      y: head.y + delta.y
    };

    if (isOutOfBounds(nextHead, state.rows, state.cols)) {
      return {
        rows: state.rows,
        cols: state.cols,
        snake: state.snake.map(clonePoint),
        direction: direction,
        pendingDirection: direction,
        food: state.food ? clonePoint(state.food) : null,
        score: state.score,
        gameOver: true,
        paused: false
      };
    }

    var willGrow = Boolean(state.food && pointsEqual(nextHead, state.food));
    var bodyToCheck = willGrow
      ? state.snake
      : state.snake.slice(0, Math.max(0, state.snake.length - 1));

    if (isOnSnake(nextHead, bodyToCheck)) {
      return {
        rows: state.rows,
        cols: state.cols,
        snake: state.snake.map(clonePoint),
        direction: direction,
        pendingDirection: direction,
        food: state.food ? clonePoint(state.food) : null,
        score: state.score,
        gameOver: true,
        paused: false
      };
    }

    var nextSnake = [nextHead];
    var i;
    for (i = 0; i < state.snake.length; i += 1) {
      nextSnake.push(clonePoint(state.snake[i]));
    }

    var nextScore = state.score;
    var nextFood = state.food ? clonePoint(state.food) : null;

    if (willGrow) {
      nextScore += 1;
      nextFood = generateFood(state.rows, state.cols, nextSnake, rng);
    } else {
      nextSnake.pop();
    }

    return {
      rows: state.rows,
      cols: state.cols,
      snake: nextSnake,
      direction: direction,
      pendingDirection: direction,
      food: nextFood,
      score: nextScore,
      gameOver: false,
      paused: false
    };
  }

  function togglePause(state) {
    if (state.gameOver) {
      return state;
    }

    return {
      rows: state.rows,
      cols: state.cols,
      snake: state.snake.map(clonePoint),
      direction: state.direction,
      pendingDirection: state.pendingDirection,
      food: state.food ? clonePoint(state.food) : null,
      score: state.score,
      gameOver: state.gameOver,
      paused: !state.paused
    };
  }

  function restartGame(state, randomFn) {
    return createInitialState({
      rows: state.rows,
      cols: state.cols,
      randomFn: randomFn || Math.random
    });
  }

  var api = Object.freeze({
    DIRECTIONS: DIRECTIONS,
    OPPOSITE: OPPOSITE,
    createInitialState: createInitialState,
    withDirection: withDirection,
    tick: tick,
    togglePause: togglePause,
    restartGame: restartGame,
    generateFood: generateFood,
    isOutOfBounds: isOutOfBounds,
    isOnSnake: isOnSnake,
    pointsEqual: pointsEqual
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.SnakeLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
