'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PANELS, getPanel, type Panel } from './panels';

// --- Basic tiles & map ----------------------------------------------------
const TILE = 32;               // px per tile
const COLS = 24;
const ROWS = 14;

// 0 = floor, 1 = wall
// Simple cozy house plan: foyer center, rooms around. Tweak later or swap with Tiled.
const MAP:number[] = (() => {
  const grid = Array(ROWS * COLS).fill(0);
  // outer walls
  for (let x=0;x<COLS;x++){ grid[x]=1; grid[(ROWS-1)*COLS + x]=1; }
  for (let y=0;y<ROWS;y++){ grid[y*COLS]=1; grid[y*COLS + (COLS-1)]=1; }
  // inner walls (create corridors)
  const wall = (x:number,y:number)=>{ grid[y*COLS+x]=1; };
  for(let x=6;x<18;x++) wall(x,6);
  for(let y=3;y<11;y++) wall(12,y);
  // door gaps
  grid[6*COLS + 11]=0; // gap in top horizontal
  grid[6*COLS + 12]=0;
  grid[5*COLS + 12]=0; // vertical corridor gap
  return grid;
})();

type HS = { id:string; x:number; y:number; w:number; h:number; label:string }
// Hotspots (tile coordinates). Stand inside and press E to open panel.
const HOTSPOTS: HS[] = [
  { id:'foyer',   x:11, y:7,  w:2, h:2, label:'Foyer' },
  { id:'lab',     x:4,  y:3,  w:4, h:3, label:'Lab' },
  { id:'workshop-techauto', x:16, y:3, w:4, h:3, label:'Workshop (Tech-Auto)' },
  { id:'workshop-stabilus', x:4,  y:9,  w:4, h:3, label:'Workshop (Stabilus)' },
  { id:'study',   x:16, y:9,  w:4, h:3, label:'Study' },
  { id:'ai-den',  x:10, y:2,  w:4, h:2, label:'AI Den' },
  { id:'library', x:2,  y:6,  w:3, h:2, label:'Library' },
  { id:'coffee',  x:19, y:6,  w:3, h:2, label:'Coffee' },
  { id:'garden',  x:11, y:12, w:2, h:1, label:'Garden' },
];

function aabb(ax:number,ay:number,aw:number,ah:number, bx:number,by:number,bw:number,bh:number){
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

export default function World() {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [openPanel, setOpenPanel] = useState<Panel|null>(null);

  // player state
  const [px, setPx] = useState(11*TILE); // pixel coords
  const [py, setPy] = useState(9*TILE);
  const [vx, setVx] = useState(0);
  const [vy, setVy] = useState(0);

  // controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (openPanel) return; // freeze movement with modal
      if (e.key === 'ArrowLeft' || e.key === 'a') setVx(-1);
      if (e.key === 'ArrowRight'|| e.key === 'd') setVx(1);
      if (e.key === 'ArrowUp'   || e.key === 'w') setVy(-1);
      if (e.key === 'ArrowDown' || e.key === 's') setVy(1);
      if (e.key === 'e') {
        // check interaction
        const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
        const hit = HOTSPOTS.find(h =>
          aabb(tx,ty,1,1, h.x,h.y,h.w,h.h)
        );
        if (hit) setOpenPanel(getPanel(hit.id) || null);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowLeft','a'].includes(e.key) && vx<0) setVx(0);
      if (['ArrowRight','d'].includes(e.key) && vx>0) setVx(0);
      if (['ArrowUp','w'].includes(e.key) && vy<0) setVy(0);
      if (['ArrowDown','s'].includes(e.key) && vy>0) setVy(0);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [px,py,vx,vy,openPanel]);

  // mobile interact
  const interact = () => {
    const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
    const hit = HOTSPOTS.find(h => aabb(tx,ty,1,1, h.x,h.y,h.w,h.h));
    if (hit) setOpenPanel(getPanel(hit.id) || null);
  };

  // movement + collisions
  useEffect(() => {
    let raf = 0;
    const speed = 2.2; // px/frame

    const step = () => {
      let nx = px + vx*speed;
      let ny = py + vy*speed;

      const col = (xx:number, yy:number) => MAP[ Math.floor(yy/TILE)*COLS + Math.floor(xx/TILE) ] === 1;
      // simple 4-sample collision
      const half = TILE*0.35;
      const canX = !(
        col(nx-half, py-half) || col(nx+half, py-half) ||
        col(nx-half, py+half) || col(nx+half, py+half)
      );
      if (canX) setPx(nx);
      const canY = !(
        col(px-half, ny-half) || col(px+half, ny-half) ||
        col(px-half, ny+half) || col(px+half, ny+half)
      );
      if (canY) setPy(ny);

      draw();
      raf = requestAnimationFrame(step);
    };

    const draw = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = COLS*TILE;
      c.height = ROWS*TILE;
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // floor
      ctx.fillStyle = '#fff7f6';
      ctx.fillRect(0,0,c.width,c.height);

      // tiles
      for (let y=0;y<ROWS;y++){
        for (let x=0;x<COLS;x++){
          const v = MAP[y*COLS+x];
          if (v===1){
            ctx.fillStyle = '#ead4d1';
            ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
          }
        }
      }

      // hotspots
      ctx.font = '12px "Courier Prime", monospace';
      HOTSPOTS.forEach(h=>{
        ctx.fillStyle = 'rgba(209, 120, 128, .15)';
        ctx.fillRect(h.x*TILE, h.y*TILE, h.w*TILE, h.h*TILE);
        ctx.fillStyle = '#7d5e65';
        ctx.fillText(h.label, h.x*TILE+4, h.y*TILE-4);
      });

      // player (rounded square)
      const r = TILE*0.35;
      ctx.fillStyle = '#b14b5e';
      roundRect(ctx, px-r, py-r, r*2, r*2, 6); ctx.fill();
      ctx.strokeStyle = '#7d5e65';
      ctx.lineWidth = 1; ctx.stroke();
    };

    step();
    return () => cancelAnimationFrame(raf);
  }, [px,py,vx,vy]);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">The Cozy House</h1>
      <p className="text-muted mb-3">Move with WASD/Arrow keys. Stand on a room and press <b>E</b> to open it.</p>

      <div className="relative overflow-auto border rounded-xl" style={{borderColor:"var(--border)"}}>
        <canvas ref={canvasRef} className="block mx-auto" style={{imageRendering:'pixelated'}} />
        {/* Mobile interact button */}
        <div className="absolute right-2 bottom-2">
          <button onClick={interact} className="btn">Interact (E)</button>
        </div>
      </div>

      {/* Modal panel */}
      {openPanel && <PanelModal panel={openPanel} onClose={()=>setOpenPanel(null)} />}
      <div className="mt-6">
        <a href="/" className="underline text-muted">← Back home</a>
      </div>
    </div>
  );
}

// helper to draw rounded rect
function roundRect(ctx:CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function PanelModal({panel,onClose}:{panel:Panel,onClose:()=>void}){
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="panel max-w-xl w-full p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-medium">{panel.title}</h2>
          <button onClick={onClose} className="btn">Close</button>
        </div>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          {panel.bullets.map((b,i)=><li key={i}>{b}</li>)}
        </ul>
        {panel.chips && (
          <div className="mt-3 flex flex-wrap gap-2">
            {panel.chips.map(c=>(
              <span key={c} className="text-xs px-2 py-1 rounded-full" style={{border:"1px solid var(--border)", color:"var(--muted)"}}>{c}</span>
            ))}
          </div>
        )}
        {panel.ctas && (
          <div className="mt-4 flex flex-wrap gap-3">
            {panel.ctas.map(c=>(
              <a key={c.label} href={c.href} {...(c.external?{target:"_blank",rel:"noreferrer"}:{})}
                 className="btn">{c.label}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
