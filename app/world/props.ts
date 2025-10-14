// app/world/props.ts
export type Prop = {
  img: string;
  x: number; // tile coordinate
  y: number; // tile coordinate
  fp?: number; // footprint height in px from the bottom (collision band)
  layer?: 'floor' | 'tabletop' | 'wall';
};

const P: Prop[] = [
  // --- Library / Study furniture
  { img: '/props/bookshelf1_32x48.png', x: 7,  y: 5,  fp: 8 },
  { img: '/props/bookshelf2_32x48.png', x: 9,  y: 5,  fp: 8 },
  { img: '/props/sofa_48x32.png',       x: 20, y: 14, fp: 8 },
  { img: '/props/coffee_table_32x20.png',x: 21, y: 15, fp: 6 },
  { img: '/props/lamp_16x44.png',        x: 24, y: 14, fp: 6 },
  { img: '/props/plant_16x36.png',       x: 10, y: 7,  fp: 6 },

  // --- Desk corner (+ tabletop items)
  { img: '/props/desk_48x40.png',     x: 23, y: 10, fp: 7 },
  { img: '/props/chair_16x24.png',    x: 22, y: 11, fp: 7 },
  { img: '/props/laptop_16x16.png',   x: 24, y: 10, layer: 'tabletop' },
  { img: '/props/coffee_machine_16x22.png', x: 30, y: 8, layer: 'tabletop' },
  { img: '/props/coffee_cup_8x8.png', x: 22, y: 15, layer: 'tabletop' },
  { img: '/props/plant_13x15.png',    x: 7,  y: 6,  layer: 'tabletop' },

  // --- Garden
  { img: '/props/fountain_64x64.png', x: 14, y: 13, fp: 12 },

  // --- Bedroom
  { img: '/props/bed_32x44.png',      x: 9,  y: 15, fp: 9 },

  // --- Window on the wall layer (no floor collision)
  { img: '/props/window_16x16.png',   x: 9,  y: 14, layer: 'wall' },
];

export default P;
