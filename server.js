const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Matter = require('matter-js');

const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Vector = Matter.Vector;

const PORT = process.env.PORT || 3000;
const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;
const BALL_RADIUS = 20;
const PILLAR_RADIUS = 15;
const HOOK_STRENGTH = 0.002;
const MAX_SPEED = 15;

app.use(express.static('public'));

const engine = Engine.create({ gravity: { x: 0, y: 0 } });
const world = engine.world;

const players = {};
const pillars = [];

// Create static pillars
for (let i = 0; i < 30; i++) {
  const x = Math.random() * WORLD_WIDTH;
  const y = Math.random() * WORLD_HEIGHT;
  const pillar = Bodies.circle(x, y, PILLAR_RADIUS, { isStatic: true });
  World.add(world, pillar);
  pillars.push({ x, y, radius: PILLAR_RADIUS });
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  const x = Math.random() * WORLD_WIDTH;
  const y = Math.random() * WORLD_HEIGHT;
  const body = Bodies.circle(x, y, BALL_RADIUS, {
    restitution: 0.8,
    friction: 0.01,
    frictionAir: 0.01,
  });
  World.add(world, body);

  players[socket.id] = {
    id: socket.id,
    body,
    hooked: false,
    hookTarget: null,
    score: 0,
  };

  socket.emit('init', {
    id: socket.id,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    pillars,
  });

  socket.on('hook', (data) => {
    const player = players[socket.id];
    if (!player) return;

    if (data.release) {
      player.hooked = false;
      player.hookTarget = null;
    } else {
      const nearest = findNearestPillar(player.body.position, data.mouseX, data.mouseY);
      if (nearest) {
        player.hooked = true;
        player.hookTarget = nearest;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    const player = players[socket.id];
    if (player) {
      World.remove(world, player.body);
      delete players[socket.id];
    }
  });
});

function findNearestPillar(playerPos, mouseX, mouseY) {
  const mouseDir = Vector.normalise({ x: mouseX - playerPos.x, y: mouseY - playerPos.y });
  let bestPillar = null;
  let bestScore = -1;

  pillars.forEach((pillar) => {
    const toPillar = Vector.sub(pillar, playerPos);
    const dist = Vector.magnitude(toPillar);
    if (dist > 300) return;

    const dir = Vector.normalise(toPillar);
    const dot = Vector.dot(dir, mouseDir);

    if (dot > bestScore) {
      bestScore = dot;
      bestPillar = pillar;
    }
  });

  return bestPillar;
}

function gameLoop() {
  Engine.update(engine, 1000 / 60);

  Object.values(players).forEach((player) => {
    if (player.hooked && player.hookTarget) {
      const force = Vector.sub(player.hookTarget, player.body.position);
      const dist = Vector.magnitude(force);
      const strength = Math.min(dist * HOOK_STRENGTH, 0.05);
      Body.applyForce(player.body, player.body.position, Vector.mult(Vector.normalise(force), strength));
    }

    const speed = Vector.magnitude(player.body.velocity);
    if (speed > MAX_SPEED) {
      Body.setVelocity(player.body, Vector.mult(Vector.normalise(player.body.velocity), MAX_SPEED));
    }
  });

  // Collision detection
  const playerList = Object.values(players);
  for (let i = 0; i < playerList.length; i++) {
    for (let j = i + 1; j < playerList.length; j++) {
      const p1 = playerList[i];
      const p2 = playerList[j];
      const dist = Vector.magnitude(Vector.sub(p1.body.position, p2.body.position));

      if (dist < BALL_RADIUS * 2) {
        const v1 = Vector.magnitude(p1.body.velocity);
        const v2 = Vector.magnitude(p2.body.velocity);

        if (v1 > v2 * 1.5) {
          eliminatePlayer(p2.id);
          p1.score++;
        } else if (v2 > v1 * 1.5) {
          eliminatePlayer(p1.id);
          p2.score++;
        }
      }
    }
  }

  const state = Object.values(players).map((p) => ({
    id: p.id,
    x: p.body.position.x,
    y: p.body.position.y,
    vx: p.body.velocity.x,
    vy: p.body.velocity.y,
    hooked: p.hooked,
    hookTarget: p.hookTarget,
    score: p.score,
  }));

  io.emit('state', state);
}

function eliminatePlayer(id) {
  const player = players[id];
  if (player) {
    World.remove(world, player.body);
    delete players[id];
    io.to(id).emit('eliminated');
  }
}

setInterval(gameLoop, 1000 / 60);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
