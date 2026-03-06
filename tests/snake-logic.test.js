const test = require("node:test");
const assert = require("node:assert/strict");

const SnakeLogic = require("../snake-logic.js");

function makeState(overrides = {}) {
  return {
    rows: 5,
    cols: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    direction: "right",
    pendingDirection: "right",
    food: { x: 4, y: 4 },
    score: 0,
    gameOver: false,
    paused: false,
    ...overrides
  };
}

test("tick moves snake forward by one cell", function () {
  const next = SnakeLogic.tick(makeState(), () => 0);

  assert.equal(next.gameOver, false);
  assert.deepEqual(next.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 }
  ]);
  assert.equal(next.score, 0);
});

test("tick grows snake and increments score when food is eaten", function () {
  const state = makeState({ food: { x: 3, y: 2 } });
  const next = SnakeLogic.tick(state, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
  assert.equal(SnakeLogic.isOnSnake(next.food, next.snake), false);
});

test("tick marks game over when snake hits wall", function () {
  const state = makeState({
    snake: [{ x: 4, y: 1 }],
    direction: "right",
    pendingDirection: "right"
  });

  const next = SnakeLogic.tick(state, () => 0);
  assert.equal(next.gameOver, true);
  assert.deepEqual(next.snake, state.snake);
});

test("tick marks game over when snake hits itself", function () {
  const state = makeState({
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 }
    ],
    direction: "up",
    pendingDirection: "up"
  });

  const next = SnakeLogic.tick(state, () => 0);
  assert.equal(next.gameOver, true);
});

test("withDirection ignores immediate reverse direction", function () {
  const state = makeState({
    direction: "right",
    pendingDirection: "right"
  });

  const next = SnakeLogic.withDirection(state, "left");
  assert.equal(next.pendingDirection, "right");
});

test("generateFood returns null when board is full", function () {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ];

  const food = SnakeLogic.generateFood(2, 2, snake, () => 0);
  assert.equal(food, null);
});
