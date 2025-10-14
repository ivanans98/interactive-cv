'use client';

import { useEffect, useRef, useState } from 'react';
import { PANELS, getPanel, type Panel } from './panels';

/** ===== World constants ===== */
const TILE = 32;
const COLS = 30;
const ROWS = 20;
const SPEED = 2.0;

type HS = { id:string; x:number; y:number; w:number; h:number; label:string }
const HOTSPOTS: HS[] = [
  { id:'foyer',   x:14, y:10, w:2, h:2, label:'Foyer' },
  { id:'lab',     x:5,  y:4,  w:6, h:4, label:'Lab' },
  { id:'workshop-techauto', x:20, y:4, w:6, h:4, label:'Workshop (Tech-Auto)' },
  { id:'workshop-stabilus', x:5,  y:13, w:6, h:4, label:'Workshop (Stabilus)' },
  { id:'study',   x:20, y:13, w:6, h:4, label:'Study' },
  { id:'ai-den',  x:12, y:3,  w:6, h:3, label:'AI Den' },
  { id:'library', x:3,  y:9,  w:4, h:3, label:'Library' },
  { id:'coffee',  x:23, y:9,  w:4, h:3, label:'Coffee' },
  { id:'garden',  x:14, y:17, w:2, h:1, label:'Garden' },
];

type NPC = { name:string; x:number; y:number; line:string };
const CATS: NPC[] = [
  { name: 'Cookie', x: 23*TILE+TILE*0.5, y: 10*TILE+TILE*0.5, line: 'Hi! I‘m Cookie 🐾' },
  { name: 'Belle', x: 7*TILE+TILE*0.5,  y: 10*TILE+TILE*0.5, line: 'Hi! I‘m Belle 🐾' },
];

/** ===== small helpers ===== */
const ixy = (x:number,y:number)=> y*COLS + x;
function aabb(ax:number,ay:number,aw:number,ah:number, bx:number,by:number,bw:number,bh:number){
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

/** ===== simple house map: 0 floor, 1 wall ===== */
const MAP:number[] = (() => {
  const g = Array(ROWS*COLS).fill(0);
  // outer frame
  for (let x=0;x<COLS;x++){ g[ixy(x,0)]=1; g[ixy(x,ROWS-1)]=1; }
  for (let y=0;y<ROWS;y++){ g[ixy(0,y)]=1; g[ixy(COLS-1,y)]=1; }

  // corridors + rooms style walls (soft rose)
  const wall = (x:number,y:number)=>{ g[ixy(x,y)]=1; };
  // horizontal spine
  for (let x=6;x<COLS-6;x++) wall(x, 10);
  // vertical to garden
  for (let y=10;y<ROWS-2;y++) wall(15,y);
  // room frames (thin edges)
  const frame = (x:number,y:number,w:number,h:number)=>{
    for(let i=x;i<x+w;i++){ wall(i,y); wall(i,y+h-1); }
    for(let j=y;j<y+h;j++){ wall(x,j); wall(x+w-1,j); }
  };
  frame(5,4,6,4);     // lab
  frame(20,4,6,4);    // techauto
  frame(5,13,6,4);    // stabilus
  frame(20,13,6,4);   // study
  frame(12,3,6,3);    // ai-den
  frame(3,9,4,3);     // library
  frame(23,9,4,3);    // coffee
  frame(14,17,2,1);   // garden edge
  // door gaps
  g[ixy(15,10)] = 0;
  g[ixy(14,10)] = 0;
  return g;
})();

/** ===== Procedural pixel sprites =====
 * Ivana (12 frames) + two cats.
 * These draw onto an offscreen canvas so you can swap to PNGs later.
 */
function makeIvanaFrames() {
  // 16x16 pixel body drawn in blocks; scale ×2 when painting.
  const frames:HTMLCanvasElement[] = [];
  const drawOne = (dir:0|1|2|3, step:0|1|2) => {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d')!;
    const hair = '#2a1b1f', skin='#3b2a2e', blush='#b56a72', dress='#e59aa7', trim='#fff2f2', shoes='#2a1b1f';
    // shadow of step: alternate arms & legs
    const leg = step===1? 1 : 0;
    // hair
    ctx.fillStyle = hair; ctx.fillRect(3,2,10,7);
    ctx.fillRect(2,5,12,3);
    // face
    ctx.fillStyle = skin; ctx.fillRect(6,5,4,4);
    // blush
    ctx.fillStyle = blush; ctx.fillRect(5,7,1,1); ctx.fillRect(10,7,1,1);
    // eyes
    ctx.fillStyle = '#1a1214'; ctx.fillRect(7,6,1,1); ctx.fillRect(9,6,1,1);
    // dress
    ctx.fillStyle = dress; ctx.fillRect(5,9,6,4);
    // collar
    ctx.fillStyle = trim; ctx.fillRect(5,9,6,1);
    // arms
    ctx.fillStyle = skin;
    if (dir===0||dir===1){ // facing down/right: alternate
      ctx.fillRect(4,10-leg,1,2); ctx.fillRect(11,10+leg,1,2);
    }else{
      ctx.fillRect(4,10+leg,1,2); ctx.fillRect(11,10-leg,1,2);
    }
    // legs
    ctx.fillStyle = shoes;
    ctx.fillRect(6-leg,13,2,2); ctx.fillRect(8+leg,13,2,2);
    return c;
  };
  (['down','left','right','up'] as const).forEach((_,dir) => {
    frames.push(drawOne(dir as 0|1|2|3,0));
    frames.push(drawOne(dir as 0|1|2|3,1));
    frames.push(drawOne(dir as 0|1|2|3,2));
  });
  return frames;
}
function drawIvana(ctx:CanvasRenderingContext2D, frames:HTMLCanvasElement[], x:number,y:number, dir:0|1|2|3, t:number){
  const base = dir*3;
  const frame = frames[ base + Math.floor(t/8)%3 ];
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(frame, Math.round(x)-16, Math.round(y)-18, 32, 32);
}

function makeCat(color='#e7a264'){
  const c = document.createElement('canvas'); c.width=16; c.height=16;
  const ctx = c.getContext('2d')!;
  const fur = color, line='#6b4c30';
  ctx.fillStyle=fur; ctx.fillRect(3,7,10,6); // body
  ctx.fillRect(4,5,3,2); ctx.fillRect(9,5,3,2); // ears
  ctx.fillRect(1,9,2,3); ctx.fillRect(13,9,2,3); // cheeks
  ctx.fillRect(2,12,12,1); // base
  ctx.fillStyle=line; // eyes
  ctx.fillRect(6,9,1,1); ctx.fillRect(9,9,1,1);
  return c;
}
function drawCat(ctx:CanvasRenderingContext2D, img:HTMLCanvasElement, x:number,y:number){
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img, Math.round(x)-14, Math.round(y)-14, 28, 28);
}

/** ===== Main component ===== */
export default function World() {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [openPanel, setOpenPanel] = useState<Panel|null>(null);
  const [openLine, setOpenLine] = useState<string|null>(null);

  // player state
  const [px, setPx] = useState(14*TILE);
  const [py, setPy] = useState(14*TILE);
  const [vx, setVx] = useState(0);
  const [vy, setVy] = useState(0);
  const [dir, setDir] = useState<0|1|2|3>(0);
  const [t, setT] = useState(0); // animation clock

  // generate sprites once
  const ivanaFramesRef = useRef<HTMLCanvasElement[]|null>(null);
  const catsRef = useRef<{Cookie:HTMLCanvasElement, Belle:HTMLCanvasElement}|null>(null);
  useEffect(()=>{
    ivanaFramesRef.current = makeIvanaFrames();
    catsRef.current = { Cookie: makeCat('#e2a05a'), Belle: makeCat('#e7b16a') };
  },[]);

  // controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (openPanel || openLine) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') { setVx(-1); setDir(1); }
      if (e.key === 'ArrowRight'|| e.key === 'd') { setVx(1);  setDir(2); }
      if (e.key === 'ArrowUp'   || e.key === 'w') { setVy(-1); setDir(3); }
      if (e.key === 'ArrowDown' || e.key === 's') { setVy(1);  setDir(0); }
      if (e.key === 'e') interact();
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
  }, [vx,vy,openPanel,openLine]);

  const interact = () => {
    // talk to a nearby cat?
    for(const c of CATS){
      if (Math.hypot(px - c.x, py - c.y) < 28){
        setOpenLine(`${c.line} — ${c.name}`);
        return;
      }
    }
    // or open a room panel
    const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
    const hit = HOTSPOTS.find(h => aabb(tx,ty,1,1, h.x,h.y,h.w,h.h));
    if (hit) setOpenPanel(getPanel(hit.id) || null);
  };

  // movement + drawing
  useEffect(() => {
    let raf = 0;
    const step = () => {
      // animate
      setT(v => (v+1)%9999);

      // movement with collision
      let nx = px + vx*SPEED;
      let ny = py + vy*SPEED;

      const col = (xx:number, yy:number) => MAP[ Math.floor(yy/TILE)*COLS + Math.floor(xx/TILE) ] === 1;
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
      if (!c || !ivanaFramesRef.current || !catsRef.current) return;
      const ctx = c.getContext('2d')!;
      // canvas size & camera center
      c.width = COLS*TILE; c.height = ROWS*TILE;
      ctx.imageSmoothingEnabled = false;

      // floor parquet pattern
      ctx.fillStyle = '#fff7f6'; ctx.fillRect(0,0,c.width,c.height);
      for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
          if ((x+y)%2===0){
            ctx.fillStyle = '#f4e4e2';
            ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
          }
        }
      }

      // walls
      for (let y=0;y<ROWS;y++){
        for (let x=0;x<COLS;x++){
          if (MAP[ixy(x,y)] === 1){
            ctx.fillStyle = '#ead4d1';
            ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
          }
        }
      }

      // hotspots (soft blocks) + labels
      ctx.font = '12px "Courier Prime", monospace';
      HOTSPOTS.forEach(h=>{
        ctx.fillStyle = 'rgba(209, 120, 128, .10)';
        ctx.fillRect(h.x*TILE, h.y*TILE, h.w*TILE, h.h*TILE);
        ctx.fillStyle = '#7d5e65';
        ctx.fillText(h.label, h.x*TILE+3, h.y*TILE-4);
      });

      // cats
      drawCat(ctx, catsRef.current.Cookie, CATS[0].x, CATS[0].y);
      drawCat(ctx, catsRef.current.Belle, CATS[1].x, CATS[1].y);

      // ivana
      drawIvana(ctx, ivanaFramesRef.current, px, py, dir, t);

      // interaction hint if near something
      const nearCat = CATS.some(c => Math.hypot(px - c.x, py - c.y) < 30);
      const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
      const onRoom = HOTSPOTS.find(h => aabb(tx,ty,1,1, h.x,h.y,h.w,h.h));
      if (nearCat || onRoom){
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        ctx.fillRect(px-24, py-42, 48, 18);
        ctx.fillStyle = '#7d5e65';
        ctx.fillText('Press E', px-18, py-29);
      }
    };

    step();
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [px,py,vx,vy]);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">The Cozy House</h1>
      <p className="text-muted mb-3">
        Move with WASD/Arrow keys. Stand on a room or near a cat and press <b>E</b>.
      </p>

      <div className="relative overflow-auto border rounded-xl"
           style={{borderColor:"var(--border)"}}>
        <canvas ref={canvasRef}
                className="block mx-auto"
                style={{ imageRendering:'pixelated' }} />
        {/* Mobile button */}
        <div className="absolute right-2 bottom-2">
          <button onClick={()=>interact()} className="btn">Interact (E)</button>
        </div>
      </div>

      {/* Room modal */}
      {openPanel && <PanelModal panel={openPanel} onClose={()=>setOpenPanel(null)} />}
      {/* Cat bubble */}
      {openLine && (
        <Bubble onClose={()=>setOpenLine(null)}>
          {openLine}
        </Bubble>
      )}

      <div className="mt-6">
        <a href="/" className="underline text-muted">← Back home</a>
      </div>
    </div>
  );
}

/** ===== UI bits ===== */
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
              <span key={c} className="text-xs px-2 py-1 rounded-full"
                    style={{border:"1px solid var(--border)", color:"var(--muted)"}}>
                {c}
              </span>
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

function Bubble({children,onClose}:{children:React.ReactNode; onClose:()=>void}){
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
      <div className="panel px-4 py-3 max-w-sm w-full flex items-center gap-3">
        <span>{children}</span>
        <button onClick={onClose} className="btn ml-auto">OK</button>
      </div>
    </div>
  );
}
