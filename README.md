# 🎮 Tether.io

A physics-based multiplayer .io game where players control spiked balls that swing from pillars using grappling hooks. Slam into opponents at high speed to eliminate them!

## 🎯 Game Concept

- **No WASD Movement**: You only move by grappling to pillars and swinging
- **Physics-Driven**: Momentum and timing are everything
- **Competitive**: Higher speed wins in collisions
- **Skill-Based**: Easy to learn, hard to master

## 🚀 Quick Start

### Prerequisites
- Node.js 14 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Run Locally

```bash
npm start
```

Then open `http://localhost:3000` in your browser.

### Development Mode (Auto-restart)

```bash
npm run dev
```

## 🎮 How to Play

1. **Click and hold** to shoot your grappling hook at the nearest pillar in that direction
2. **Release** to let go and fly with momentum
3. **Swing around pillars** to build up speed
4. **Slam into other players** when you're faster to eliminate them
5. **Survive** and climb the leaderboard!

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + Socket.io
- **Physics**: Matter.js (server-authoritative)
- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Networking**: WebSocket (Socket.io)

## 💰 Monetization Ideas

- Skins for player balls (emoji faces, sports balls, etc.)
- Trail effects (fire, neon, rainbow)
- Custom spike colors/styles
- Respawn ads
- Battle pass system

## 📁 Project Structure

```
tether-io/
├── server.js          # Game server with physics loop
├── public/
│   └── index.html     # Client-side game rendering
├── package.json       # Dependencies
└── README.md          # This file
```

## 🎨 Customization

You can easily customize:
- World size (WORLD_WIDTH, WORLD_HEIGHT)
- Number of pillars
- Hook strength and range
- Ball radius and speed limits
- Collision damage thresholds

## 🐛 Known Issues

See the [Issues](https://github.com/NitroFoxx/tether-io/issues) tab for current bugs and feature requests.

## 📜 License

MIT License - Feel free to use this for learning or commercial projects!

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Made with ❤️ by NitroFoxx
