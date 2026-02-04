# 🏡 The Cozy House – Interactive RPG Portfolio

A gamified personal portfolio built from scratch using **React**, **TypeScript**, and the **HTML5 Canvas API**. 

Instead of a traditional static resume, users can explore a 2D pixel-art world, interacting with objects (like the bookshelf for projects or the laptop for skills) to learn about my professional background.

**[🚀 Live Demo](https://www.ivananavarretesanteliz.com/)**

## 🛠 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) / React 18
* **Language:** TypeScript
* **Rendering Engine:** HTML5 Canvas API
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

## ✨ Key Features

* **Custom Game Engine:** A `requestAnimationFrame` game loop handling physics, updates, and rendering at 60fps.
* **Collision Detection:** AABB (Axis-Aligned Bounding Box) logic for wall collisions and object interaction.
* **Responsive Controls:**
    * **Desktop:** WASD / Arrow Keys support.
    * **Mobile:** Custom on-screen D-Pad and interaction buttons with multi-touch support.
* **Dynamic Asset Loading:** Asynchronous pre-loading of sprite sheets and props to ensure smooth gameplay.
* **Programmatic Sprites:** The main character and NPCs are generated code-side using Canvas primitives, allowing for dynamic color changes without external image files.

## 🧩 Technical Highlights

### 1. The Game Loop
Unlike typical React apps that rely on the DOM, this project uses a `useRef` to access a `<canvas>` element. The rendering logic is decoupled from React's render cycle to ensure high performance.

```typescript
// Simplified logic from the main loop
const step = () => {
  // 1. Calculate next position based on velocity
  let nx = px + vx * SPEED;
  let ny = py + vy * SPEED;

  // 2. Check collisions (AABB & Tile Map)
  if (!isWall(nx, py)) setPx(nx);
  if (!isWall(px, ny)) setPy(ny);

  // 3. Draw frame
  draw();
  requestAnimationFrame(step);
};
```

### 2. Tile-Based Mapping
The world is constructed using a coordinate grid system. Walls and obstacles are mapped in a binary array (MAP), allowing for efficient O(1) lookup times during collision checks.

### 3. Interaction System
A proximity check runs on every frame. If the player is within range of a "Hotspot" (defined as a Rect object), an interaction prompt appears.

```typescript
const interact = () => {
  // Check proximity to NPCs
  for (const c of CATS) {
    if (Math.hypot(px - c.x, py - c.y) < 28) {
      setOpenLine(`${c.line} — ${c.name}`);
      return;
    }
  }
  // Check Hotspots (Projects, Skills, etc.)
  const hit = HOTSPOTS.find(h => aabb(tx, ty, 1, 1, h.rect.x, h.rect.y, h.rect.w, h.rect.h));
  if (hit) setOpenPanel(getPanel(hit.id));
};
```
