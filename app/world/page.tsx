'use client';

import { useEffect, useRef, useState } from 'react';
import { PANELS, getPanel, type Panel } from './panels';
import PROPS, { type Prop } from './props';

/* ================= World constants ================= */
const TILE = 32;
const COLS = 30;
const ROWS = 20;
const SPEED = 2.0;

type HS = { id:string; x:number; y:number; w:number; h:number; label:string };
const HOTSPOTS: HS[] = [
  { id:'foyer',   x:14, y:10, w:2, h:2, label:'Foyer' },
  { id:'lab',     x:5,  y:4,  w:6, h:4, label:'Lab' },
  { id:'workshop-techauto', x:20, y:4, w:6, h:4, label:'Workshop (Tech-Auto)' },
  { id:'workshop-stabilus', x:5,  y:13, w:6, h:4, label:'Workshop (Stabilus)' },
  { id:'study',   x:20, y:13, w:6, h:4, label:'Study' },
  { id:'ai-den',  x:12, y:3,  w:6, h:3, label:'AI Den' },
  { id:'library', x:3,  y:9,  w:4, h:3, label:'Library' },
  { id:'coffee',  x:23, y:9,  w:4, h:3, label:'Coffee' },
  { id:'garden',  x:12, y:15, w:6, h:4, label:'Garden' }, // bigger garden
];

type NPC = { name:string; x:number; y:number; line:string };
const CATS: NPC[] = [
  { name: 'Cookie', x: 24*TILE+TILE*0.5, y:  9*TILE+TILE*0.5, line: 'Hi! I‘m Cookie 🐾' },
  { name: 'Belle',  x:  8*TILE+TILE*0.5, y: 11*TILE+TILE*0.5, line: 'Hi! I‘m Belle 🐾' },
];

/* ================= helpers ================= */
const ixy = (x:number,y:number)=> y*COLS + x;
function aabb(ax:number,ay:number,aw:number,ah:number, bx:number,by:number,bw:number,bh:number){
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

/* ================= map: 0 floor, 1 wall ================= */
const MAP:number[] = (() => {
  const g = Array(ROWS*COLS).fill(0);
  const wall = (x:number,y:number)=>{ g[ixy(x,y)]=1; };

  // outer frame
  for (let x=0;x<COLS;x++){ wall(x,0); wall(x,ROWS-1); }
  for (let y=0;y<ROWS;y++){ wall(0,y); wall(COLS-1,y); }

  const frame = (x:number,y:number,w:number,h:number)=>{
    for(let i=x;i<x+w;i++){ wall(i,y); wall(i,y+h-1); }
    for(let j=y;j<y+h;j++){ wall(x,j); wall(x+w-1,j); }
  };

  // room frames (corridors are now pure floor; no “spine” walls)
  frame(5,4,6,4);      // lab
  frame(20,4,6,4);     // techauto
  frame(5,13,6,4);     // stabilus
  frame(20,13,6,4);    // study
  frame(12,3,6,3);     // ai-den
  frame(3,9,4,3);      // library
  frame(23,9,4,3);     // coffee
  frame(12,15,6,4);    // garden (bigger)

  // 2-tile doors (centered)
  // lab bottom
  g[ixy(7,7)] = 0; g[ixy(8,7)] = 0;
  // techauto bottom
  g[ixy(22,7)] = 0; g[ixy(23,7)] = 0;
  // stabilus top
  g[ixy(7,13)] = 0; g[ixy(8,13)] = 0;
  // study top
  g[ixy(22,13)] = 0; g[ixy(23,13)] = 0;
  // ai-den bottom
  g[ixy(14,5)] = 0; g[ixy(15,5)] = 0;
  // library right → corridor
  g[ixy(6,10)] = 0; g[ixy(6,9)] = 0;
  // coffee left → corridor
  g[ixy(23,10)] = 0; g[ixy(23,9)] = 0;
  // garden top (from vertical corridor region)
  g[ixy(14,15)] = 0; g[ixy(15,15)] = 0;

  return g;
})();

/* ================= procedural sprites ================= */
function makeIvanaFrames() {
  const frames:HTMLCanvasElement[] = [];
  const drawOne = (dir:0|1|2|3, step:0|1|2) => {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d')!;
    const hair = '#2a1b1f';
    const skin = '#c89aa4'; // lighter
    const blush='#d07a85', dress='#e59aa7', trim='#fff2f2', shoes='#2a1b1f';
    const leg = step===1? 1 : 0;

    ctx.fillStyle = hair; ctx.fillRect(3,2,10,7); ctx.fillRect(2,5,12,3);
    ctx.fillStyle = skin; ctx.fillRect(6,5,4,4);
    ctx.fillStyle = blush; ctx.fillRect(5,7,1,1); ctx.fillRect(10,7,1,1);
    ctx.fillStyle = '#1a1214'; ctx.fillRect(7,6,1,1); ctx.fillRect(9,6,1,1);
    ctx.fillStyle = dress; ctx.fillRect(5,9,6,4);
    ctx.fillStyle = trim;  ctx.fillRect(5,9,6,1);
    ctx.fillStyle = skin;
    if (dir===0||dir===1){ ctx.fillRect(4,10-leg,1,2); ctx.fillRect(11,10+leg,1,2); }
    else { ctx.fillRect(4,10+leg,1,2); ctx.fillRect(11,10-leg,1,2); }
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
  ctx.fillStyle=fur; ctx.fillRect(3,7,10,6);
  ctx.fillRect(4,5,3,2); ctx.fillRect(9,5,3,2);
  ctx.fillRect(1,9,2,3); ctx.fillRect(13,9,2,3);
  ctx.fillRect(2,12,12,1);
  ctx.fillStyle=line; ctx.fillRect(6,9,1,1); ctx.fillRect(9,9,1,1);
  return c;
}
function drawCat(ctx:CanvasRenderingContext2D, img:HTMLCanvasElement, x:number,y:number){
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img, Math.round(x)-14, Math.round(y)-14, 28, 28);
}

/* ============ props support (unchanged) ============ */
type ImgRef = { el: HTMLImageElement, w: number, h: number };
const propImgs = new Map<string, ImgRef>();
function loadImage(src: string): Promise<ImgRef> {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve({ el, w: el.naturalWidth, h: el.naturalHeight });
    el.onerror = reject;
    el.src = src;
  });
}
function drawProps(ctx: CanvasRenderingContext2D) {
  const items = PROPS.map(p => {
    const ir = propImgs.get(p.img)!;
    const px = p.x * TILE;
    const py = p.y * TILE;
    const drawX = Math.round(px - ir.w / 2 + TILE / 2);
    const drawY = Math.round(py - ir.h + TILE);
    return { p, ir, drawX, drawY, z: drawY + ir.h };
  });

  for (const it of items) {
    if (it.p.layer === 'wall') {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(it.ir.el, it.drawX, it.drawY);
    }
  }

  items
    .filter(it => !it.p.layer || it.p.layer === 'floor')
    .sort((a, b) => a.z - b.z)
    .forEach(it => {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(it.ir.el, it.drawX, it.drawY);
    });

  for (const it of items) {
    if (it.p.layer === 'tabletop') {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(it.ir.el, it.drawX, it.drawY);
    }
  }
}
function collidesWithProps(feetX: number, feetY: number): boolean {
  for (const p of PROPS) {
    if (p.layer === 'tabletop' || p.layer === 'wall') continue;
    const ir = propImgs.get(p.img)!;
    const sx = p.x * TILE - ir.w / 2 + TILE / 2;
    const sy = p.y * TILE - ir.h + TILE;
    const sw = ir.w;
    const sh = ir.h;
    const fp = p.fp ?? 0;
    if (fp > 0) {
      const fx = sx, fy = sy + sh - fp, fw = sw, fh = fp;
      if (feetX >= fx && feetX <= fx + fw && feetY >= fy && feetY <= fy + fh) return true;
    }
  }
  return false;
}

/* ================= main component ================= */
export default function World() {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [openPanel, setOpenPanel] = useState<Panel|null>(null);
  const [openLine, setOpenLine] = useState<string|null>(null);

  // position/velocity as refs (smooth loop, no re-start)
  const pxRef = useRef(14*TILE);
  const pyRef = useRef(14*TILE);
  const vxRef = useRef(0);
  const vyRef = useRef(0);
  const dirRef = useRef<0|1|2|3>(0);
  const tRef = useRef(0);
  const [ready, setReady] = useState(false);

  // lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // sprites + props
  const ivanaFramesRef = useRef<HTMLCanvasElement[]|null>(null);
  const catsRef = useRef<{cookie:HTMLCanvasElement, belle:HTMLCanvasElement}|null>(null);
  useEffect(()=>{
    ivanaFramesRef.current = makeIvanaFrames();
    catsRef.current = { cookie: makeCat('#e2a05a'), belle: makeCat('#e7b16a') };
    (async () => {
      await Promise.all(PROPS.map(async p => {
        if (!propImgs.has(p.img)) propImgs.set(p.img, await loadImage(p.img));
      }));
      setReady(true);
    })();
  },[]);

  // controls (update refs, don’t re-run loop)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      if (openPanel || openLine) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') { vxRef.current = -1; dirRef.current = 1; }
      if (e.key === 'ArrowRight'|| e.key === 'd') { vxRef.current =  1; dirRef.current = 2; }
      if (e.key === 'ArrowUp'   || e.key === 'w') { vyRef.current = -1; dirRef.current = 3; }
      if (e.key === 'ArrowDown' || e.key === 's') { vyRef.current =  1; dirRef.current = 0; }
      if (e.key === 'e') interact();
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      if (['ArrowLeft','a'].includes(e.key)  && vxRef.current < 0) vxRef.current = 0;
      if (['ArrowRight','d'].includes(e.key) && vxRef.current > 0) vxRef.current = 0;
      if (['ArrowUp','w'].includes(e.key)    && vyRef.current < 0) vyRef.current = 0;
      if (['ArrowDown','s'].includes(e.key)  && vyRef.current > 0) vyRef.current = 0;
    };
    window.addEventListener('keydown', down, { passive:false });
    window.addEventListener('keyup', up, { passive:false });
    return () => { window.removeEventListener('keydown', down as any); window.removeEventListener('keyup', up as any); };
  }, [openPanel,openLine]);

  const interact = () => {
    const px = pxRef.current, py = pyRef.current;
    // cats (bigger radius)
    for(const c of CATS){
      if (Math.hypot(px - c.x, py - c.y) < 40){
        setOpenLine(`${c.line} — ${c.name}`);
        return;
      }
    }
    // rooms
    const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
    const hit = HOTSPOTS.find(h => aabb(tx,ty,1,1, h.x,h.y,h.w,h.h));
    if (hit) setOpenPanel(getPanel(hit.id) || null);
  };

  // single rAF loop — no deps, smooth movement
  useEffect(() => {
    if (!ready) return;
    let raf = 0;

    const step = () => {
      tRef.current = (tRef.current + 1) % 9999;

      // next positions
      let nx = pxRef.current + vxRef.current * SPEED;
      let ny = pyRef.current + vyRef.current * SPEED;

      const col = (xx:number, yy:number) =>
        MAP[ Math.floor(yy/TILE)*COLS + Math.floor(xx/TILE) ] === 1;

      const half = TILE*0.35;

      // X
      const nxFeetX = nx;
      const nxFeetY = pyRef.current + half;
      const canX = !(
        col(nx-half, pyRef.current-half) || col(nx+half, pyRef.current-half) ||
        col(nx-half, pyRef.current+half) || col(nx+half, pyRef.current+half)
      ) && !collidesWithProps(nxFeetX, nxFeetY);
      if (canX) pxRef.current = nx;

      // Y
      const nyFeetX = pxRef.current;
      const nyFeetY = ny + half;
      const canY = !(
        col(pxRef.current-half, ny-half) || col(pxRef.current+half, ny-half) ||
        col(pxRef.current-half, ny+half) || col(pxRef.current+half, ny+half)
      ) && !collidesWithProps(nyFeetX, nyFeetY);
      if (canY) pyRef.current = ny;

      draw();
      raf = requestAnimationFrame(step);
    };

    const draw = () => {
      const c = canvasRef.current;
      if (!c || !ivanaFramesRef.current || !catsRef.current) return;
      const ctx = c.getContext('2d')!;
      c.width = COLS*TILE; c.height = ROWS*TILE;
      ctx.imageSmoothingEnabled = false;

      // soft checker (tiles will come later)
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

      // room labels
      ctx.font = '12px "Courier Prime", monospace';
      HOTSPOTS.forEach(h=>{
        ctx.fillStyle = 'rgba(209, 120, 128, .10)';
        ctx.fillRect(h.x*TILE, h.y*TILE, h.w*TILE, h.h*TILE);
        ctx.fillStyle = '#7d5e65';
        ctx.fillText(h.label, h.x*TILE+3, h.y*TILE-4);
      });

      // props
      drawProps(ctx);

      // cats + player
      drawCat(ctx, catsRef.current.cookie, CATS[0].x, CATS[0].y);
      drawCat(ctx, catsRef.current.belle,  CATS[1].x, CATS[1].y);
      drawIvana(ctx, ivanaFramesRef.current, pxRef.current, pyRef.current, dirRef.current, tRef.current);

      // hint
      const nearCat = CATS.some(c => Math.hypot(pxRef.current - c.x, pyRef.current - c.y) < 40);
      const tx = Math.floor(pxRef.current/TILE), ty = Math.floor(pyRef.current/TILE);
      const onRoom = HOTSPOTS.find(h => aabb(tx,ty,1,1, h.x,h.y,h.w,h.h));
      if (nearCat || onRoom){
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        ctx.fillRect(pxRef.current-24, pyRef.current-42, 48, 18);
        ctx.fillStyle = '#7d5e65';
        ctx.fillText('Press E', pxRef.current-18, pyRef.current-29);
      }
    };

    step();
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">The Cozy House</h1>
      <p className="text-muted mb-3">
        Move with WASD/Arrow keys. Stand on a room or near a cat and press <b>E</b>.
      </p>

      <div className="relative overflow-hidden border rounded-xl max-w-full"
           style={{borderColor:"var(--border)"}}>
        <canvas ref={canvasRef}
                className="block mx-auto"
                style={{ imageRendering:'pixelated' }} />
        <div className="absolute right-2 bottom-2">
          <button onClick={()=>interact()} className="btn">Interact (E)</button>
        </div>
      </div>

      {openPanel && <PanelModal panel={openPanel} onClose={()=>setOpenPanel(null)} />}
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

/* ================= UI bits ================= */
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
