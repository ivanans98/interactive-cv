// app/world/props.ts
export type Prop = {
  img: string;       // /public path, e.g. '/props/sofa_48x32.png'
  x: number;         // tile coords
  y: number;
  fp?: number;       // footprint height in px (bottom band that blocks)
  layer?: 'floor' | 'wall' | 'tabletop';
};

const P: Prop[] = [
  /* ---------- Lab ---------- */
  { img: '/props/bookshelf1_32x48.png', x: 7.2, y: 6.7, fp: 14 },
  { img: '/props/bookshelf2_32x48.png', x: 8.8, y: 6.7, fp: 14 },
  { img: '/props/plant_13x15.png',      x: 6.1, y: 7.9, fp: 10 },
  { img: '/props/plant_16x36.png',      x: 9.6, y: 7.9, fp: 12 },

  /* ---------- Coffee ---------- */
  { img: '/props/desk_48x40.png',       x: 24.6, y: 10.9, fp: 12 },
  { img: '/props/chair_16x24.png',      x: 24.2, y: 11.6, fp: 10 },
  { img: '/props/coffee_machine_16x22.png', x: 23.8, y: 10.7, layer: 'tabletop' },
  { img: '/props/laptop_16x16.png',     x: 25.2, y: 10.7, layer: 'tabletop' },

  /* ---------- Study ---------- */
  { img: '/props/sofa_48x32.png',       x: 23.2, y: 15.8, fp: 12 },
  { img: '/props/coffee_table_32x20.png', x: 22.6, y: 16.3, layer: 'tabletop' },
  { img: '/props/coffee_cup_8x8.png',   x: 22.6, y: 16.2, layer: 'tabletop' },
  { img: '/props/lamp_16x44.png',       x: 24.9, y: 15.2, fp: 12 },

  /* ---------- Stabilus (bed shown as decor) ---------- */
  { img: '/props/bed_32x44.png',        x: 8.0,  y: 16.1, fp: 14 },

  /* ---------- Garden ---------- */
  { img: '/props/fountain_64x64.png',   x: 15.0, y: 17.2, fp: 22 },
];

export default P;

