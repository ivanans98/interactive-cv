'use client';

import { useEffect, useRef, useState } from 'react';
import { PANELS, getPanel, type Panel } from './panels';

/** ===== World constants ===== */
const TILE = 32;
const COLS = 30;
const ROWS = 20;
const SPEED = 2.0;
const DOOR = 2; // two-tile doors

// source tilesheet meta (your /public/tiles.png)
// layout you gave: first row (0..6), second row (7..13)
// we only need parquet and rug1 here.
const SRC_TILE = 16;
const TILE_IDX = {
  stone_path: 0,
  rug1: 1,
  parquet: 2,
  rug2: 3,
  grass: 4,
  flowers: 5,
  wall_L: 6,
  wall_TL: 7,
  wall_TR: 8,
  wall_BL: 9,
  wall_BR: 10,
  wall_T: 11,
  wall_B: 12,
  wall_R: 13,
};

type Rect = { x:number; y:number; w:number; h:number };

type HS = { id:string; rect:Rect; label:string }
const HOTSPOTS: HS[] = [
  { id:'library',  rect:{ x:3,  y:4,  w:8,  h:7 },  label:'Library' },
  { id:'study',    rect:{ x:12, y:4,  w:10, h:7 },  label:'Study' },
  { id:'workshop', rect:{ x:23, y:4,  w:5,  h:7 },  label:'Workshop' },
  { id:'lab',      rect:{ x:3,  y:12, w:10, h:6 },  label:'Lab' },
  { id:'coffee',   rect:{ x:19, y:12, w:9,  h:6 },  label:'Coffee' },
  { id:'garden',   rect:{ x:3,  y:17, w:25, h:3 },  label:'Garden' },
];

const FOYER: Rect = { x:13, y:8, w:4, h:4 }; // tiled with rug1

type NPC = { name:string; x:number; y:number; line:string };
const CATS: NPC[] = [
  // near coffee corridor, but not blocking
  { name: 'Cookie', x: (22.5)*TILE, y: (11.5)*TILE, line: 'Hi! I‘m Cookie 🐾' },
  // near library corridor, but not blocking
  { name: 'Belle',  x: (9.5)*TILE,  y: (11.5)*TILE, line: 'Hi! I‘m Belle 🐾' },
];

/** ===== helpers ===== */
const ixy = (x:number,y:number)=> y*COLS + x;
function aabb(ax:number,ay:number,aw:number,ah:number, bx:number,by:number,bw:number,bh:number){
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}
const inside = (r:Rect, x:number, y:number) =>
  x>=r.x && x<r.x+r.w && y>=r.y && y<r.y+r.h;

/** ===== Map building: 0 floor, 1 wall ===== */
const MAP:number[] = (() => {
  const g = Array(ROWS*COLS).fill(0);
  const wall = (x:number,y:number)=>{ if (x>=0 && y>=0 && x<COLS && y<ROWS) g[ixy(x,y)] = 1; };

  // outer frame
  for (let x=0;x<COLS;x++){ wall(x,0); wall(x,ROWS-1); }
  for (let y=0;y<ROWS;y++){ wall(0,y); wall(COLS-1,y); }

  const frame = (r:Rect) => {
    for(let x=r.x; x<r.x+r.w; x++){ wall(x,r.y); wall(x,r.y+r.h-1); }
    for(let y=r.y; y<r.y+r.h; y++){ wall(r.x,y); wall(r.x+r.w-1,y); }
  };

  // draw room frames
  HOTSPOTS.forEach(h => frame(h.rect));

  // --- Doors (2-tile each) ---
  // Library -> corridor: right wall opening (also connects into Study via Study's left opening)
  {
    const lib = HOTSPOTS.find(h=>h.id==='library')!.rect;
    const sy = lib.y + Math.floor(lib.h/2) - 1; // center two tiles
    for (let dy=0; dy<DOOR; dy++) g[ixy(lib.x+lib.w-1, sy+dy)] = 0; // break wall on library right
  }
  // Study left (connects to Library), and bottom (to corridor)
  {
    const st = HOTSPOTS.find(h=>h.id==='study')!.rect;
    const sy = st.y + Math.floor(st.h/2) - 1;
    for (let dy=0; dy<DOOR; dy++) g[ixy(st.x, sy+dy)] = 0;               // left door
    const bx = st.x + Math.floor(st.w/2) - 1;
    for (let dx=0; dx<DOOR; dx++) g[ixy(bx+dx, st.y+st.h-1)] = 0;        // bottom door
  }
  // Workshop left (to corridor)
  {
    const wk = HOTSPOTS.find(h=>h.id==='workshop')!.rect;
    const sy = wk.y + Math.floor(wk.h/2) - 1;
    for (let dy=0; dy<DOOR; dy++) g[ixy(wk.x, sy+dy)] = 0;
  }
  // Lab right (to corridor)
  {
    const lab = HOTSPOTS.find(h=>h.id==='lab')!.rect;
    const sy = lab.y + Math.floor(lab.h/2) - 1;
    for (let dy=0; dy<DOOR; dy++) g[ixy(lab.x+lab.w-1, sy+dy)] = 0;
  }
  // Coffee left (to corridor)
  {
    const cf = HOTSPOTS.find(h=>h.id==='coffee')!.rect;
    const sy = cf.y + Math.floor(cf.h/2) - 1;
    for (let dy=0; dy<DOOR; dy++) g[ixy(cf.x, sy+dy)] = 0;
  }
  // Garden top (centered 2 tiles)
  {
    const gd = HOTSPOTS.find(h=>h.id==='garden')!.rect;
    const cx = gd.x + Math.floor(gd.w/2) - 1;
    for (let dx=0; dx<DOOR; dx++) g[ixy(cx+dx, gd.y)] = 0;
  }

  return g;
})();

/** ===== Procedural pixel sprites (Ivana + cats) ===== */
function makeIvanaFrames() {
  const frames:HTMLCanvasElement[] = [];
  const drawOne = (dir:0|1|2|3, step:0|1|2) => {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d')!;
    const hair = '#2a1b1f';
    const skin = '#b68b92'; // ~50% lighter than before
    const blush='#c77a82', dress='#e59aa7', trim='#fff2f2', shoes='#2a1b1f';
    const leg = step===1? 1 : 0;

    ctx.fillStyle = hair; ctx.fillRect(3,2,10,7);
    ctx.fillRect(2,5,12,3);
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
  ctx.fillRect(4,5,3,2); ctx.fillRect(9,5,3,2); // ears
  ctx.fillRect(1,9,2,3); ctx.fillRect(13,9,2,3);
  ctx.fillRect(2,12,12,1);
  ctx.fillStyle=line; ctx.fillRect(6,9,1,1); ctx.fillRect(9,9,1,1);
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

  // lock body scroll while mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // generate sprites once
  const ivanaFramesRef = useRef<HTMLCanvasElement[]|null>(null);
  const catsRef = useRef<{cookie:HTMLCanvasElement, belle:HTMLCanvasElement}|null>(null);
  useEffect(()=>{
    ivanaFramesRef.current = makeIvanaFrames();
    catsRef.current = { cookie: makeCat('#e2a05a'), belle: makeCat('#e7b16a') };
  },[]);

  // load tilesheet
  const tileImgRef = useRef<HTMLImageElement|null>(null);
  useEffect(()=>{
    const img = new Image();
    img.src = '/tiles.png';
    img.onload = () => { tileImgRef.current = img; };
  },[]);

  // controls (prevent page scroll on arrows/space)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      if (openPanel || openLine) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') { setVx(-1); setDir(1); }
      if (e.key === 'ArrowRight'|| e.key === 'd') { setVx(1);  setDir(2); }
      if (e.key === 'ArrowUp'   || e.key === 'w') { setVy(-1); setDir(3); }
      if (e.key === 'ArrowDown' || e.key === 's') { setVy(1);  setDir(0); }
      if (e.key === 'e') interact();
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      if (['ArrowLeft','a'].includes(e.key) && vx<0) setVx(0);
      if (['ArrowRight','d'].includes(e.key) && vx>0) setVx(0);
      if (['ArrowUp','w'].includes(e.key) && vy<0) setVy(0);
      if (['ArrowDown','s'].includes(e.key) && vy>0) setVy(0);
    };
    window.addEventListener('keydown', down, { passive:false });
    window.addEventListener('keyup', up, { passive:false });
    return () => { window.removeEventListener('keydown', down as any); window.removeEventListener('keyup', up as any); };
  }, [vx,vy,openPanel,openLine]);

  const interact = () => {
    // cat talk?
    for(const c of CATS){
      if (Math.hypot(px - c.x, py - c.y) < 28){
        setOpenLine(`${c.line} — ${c.name}`);
        return;
      }
    }
    // room panel?
    const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
    const hit = HOTSPOTS.find(h => aabb(tx,ty,1,1, h.rect.x,h.rect.y,h.rect.w,h.rect.h));
    if (hit) setOpenPanel(getPanel(hit.id) || null);
  };

  // helper to draw a tile from tiles.png
  const drawTile = (
    ctx:CanvasRenderingContext2D,
    tileIndex:number,
    dx:number, dy:number, scale=2
  )=>{
    const img = tileImgRef.current;
    if (!img) return;
    const sx = (tileIndex % 7) * SRC_TILE;
    const sy = Math.floor(tileIndex / 7) * SRC_TILE;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, SRC_TILE, SRC_TILE, dx, dy, SRC_TILE*scale, SRC_TILE*scale);
  };

  // movement + drawing
  useEffect(() => {
    let raf = 0;
    const step = () => {
      setT(v => (v+1)%9999);

      let nx = px + vx*SPEED;
      let ny = py + vy*SPEED;

      const col = (xx:number, yy:number) => {
        const gx = Math.floor(xx/TILE), gy = Math.floor(yy/TILE);
        if (gx<0||gy<0||gx>=COLS||gy>=ROWS) return true;
        return MAP[ ixy(gx,gy) ] === 1;
      };
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
      c.width = COLS*TILE; c.height = ROWS*TILE;
      ctx.imageSmoothingEnabled = false;

      // base corridor background (light parquet checker)
      ctx.fillStyle = '#fff7f6'; ctx.fillRect(0,0,c.width,c.height);
      for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
          if ((x+y)%2===0){
            ctx.fillStyle = '#f4e4e2';
            ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
          }
        }
      }

      // room interiors: soft cream so they contrast with corridor
      ctx.fillStyle = '#fdf5f3';
      HOTSPOTS.forEach(h=>{
        const r = h.rect;
        // fill interior (minus 1px to avoid covering walls later)
        ctx.fillRect(r.x*TILE+1, r.y*TILE+1, r.w*TILE-2, r.h*TILE-2);
      });

      // foyer rug1 tiling
      for(let yy=0; yy<FOYER.h; yy++){
        for(let xx=0; xx<FOYER.w; xx++){
          drawTile(ctx, TILE_IDX.rug1, (FOYER.x+xx)*TILE, (FOYER.y+yy)*TILE, 2);
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
        ctx.fillStyle = '#7d5e65';
        ctx.fillText(h.label, h.rect.x*TILE+3, h.rect.y*TILE-4);
      });
      ctx.fillStyle = '#7d5e65';
      ctx.fillText('Foyer', FOYER.x*TILE + 3, FOYER.y*TILE - 4);

      // cats
      drawCat(ctx, catsRef.current.cookie, CATS[0].x, CATS[0].y);
      drawCat(ctx, catsRef.current.belle,  CATS[1].x, CATS[1].y);

      // simple props layout (non-blocking visuals)
      // Library props
      {
        const lib = HOTSPOTS.find(h=>h.id==='library')!.rect;
        const bs1 = new Image(); bs1.src = '/bookshelf1_32x48.png';
        const bs2 = new Image(); bs2.src = '/bookshelf2_32x48.png';
        const plant = new Image(); plant.src = '/plant_16x36.png';
        bs1.onload = ()=>ctx.drawImage(bs1, (lib.x+1)*TILE, (lib.y+1)*TILE-16);
        bs2.onload = ()=>ctx.drawImage(bs2, (lib.x+3)*TILE, (lib.y+1)*TILE-16);
        plant.onload = ()=>ctx.drawImage(plant, (lib.x+lib.w-2)*TILE, (lib.y+lib.h-2)*TILE-4);
      }
      // Coffee room props
      {
        const cf = HOTSPOTS.find(h=>h.id==='coffee')!.rect;
        const desk = new Image(); desk.src = '/desk_48x40.png';
        const chair = new Image(); chair.src = '/chair_16x24.png';
        const cm = new Image(); cm.src = '/coffee_machine_16x22.png';
        const laptop = new Image(); laptop.src = '/laptop_16x16.png';
        desk.onload = ()=>ctx.drawImage(desk, (cf.x+2)*TILE, (cf.y+2)*TILE-8);
        chair.onload = ()=>ctx.drawImage(chair, (cf.x+3)*TILE, (cf.y+3)*TILE+6);
        cm.onload = ()=>ctx.drawImage(cm, (cf.x+2)*TILE+6, (cf.y+2)*TILE-6);
        laptop.onload = ()=>ctx.drawImage(laptop, (cf.x+3)*TILE+12, (cf.y+2)*TILE+6);
      }
      // Study props
      {
        const st = HOTSPOTS.find(h=>h.id==='study')!.rect;
        const sofa = new Image(); sofa.src = '/sofa_48x32.png';
        const lamp = new Image(); lamp.src = '/lamp_16x44.png';
        const tbl = new Image(); tbl.src = '/coffee_table_32x20.png';
        sofa.onload = ()=>ctx.drawImage(sofa, (st.x+Math.floor(st.w/2)-1)*TILE, (st.y+Math.floor(st.h/2))*TILE);
        lamp.onload = ()=>ctx.drawImage(lamp, (st.x+st.w-2)*TILE+8, (st.y+Math.floor(st.h/2))*TILE-12);
        tbl.onload = ()=>ctx.drawImage(tbl, (st.x+Math.floor(st.w/2))*TILE, (st.y+Math.floor(st.h/2)+1)*TILE);
      }
      // Lab prop (bed) just for fun
      {
        const lb = HOTSPOTS.find(h=>h.id==='lab')!.rect;
        const bed = new Image(); bed.src = '/bed_32x44.png';
        bed.onload = ()=>ctx.drawImage(bed, (lb.x+lb.w-3)*TILE, (lb.y+lb.h-3)*TILE-12);
      }
      // Garden fountain (aligned left)
      {
        const gd = HOTSPOTS.find(h=>h.id==='garden')!.rect;
        const f = new Image(); f.src = '/fountain_64x64.png';
        const fx = (gd.x+1)*TILE; // left aligned
        const fy = (gd.y + Math.floor(gd.h/2))*TILE - 16;
        f.onload = ()=>ctx.drawImage(f, fx, fy, 64,64);
      }

      // character
      drawIvana(ctx, ivanaFramesRef.current, px, py, dir, t);

      // interaction hint
      const nearCat = CATS.some(c => Math.hypot(px - c.x, py - c.y) < 30);
      const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
      const onRoom = HOTSPOTS.find(h => aabb(tx,ty,1,1, h.rect.x,h.rect.y,h.rect.w,h.rect.h));
      if (nearCat || onRoom){
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        ctx.fillRect(px-24, py-42, 48, 18);
        ctx.fillStyle = '#7d5e65';
        ctx.fillText('Press E', px-18, py-29);
      }
    };

    step();
    return () => cancelAnimationFrame(raf);
  }, [px,py,vx,vy]);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">The Cozy House</h1>
      <p className="text-muted mb-3">
        Move with WASD/Arrow keys. Stand on a room or near a cat and press <b>E</b>.
      </p>

      <div className="relative overflow-auto border rounded-xl max-w-full"
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
