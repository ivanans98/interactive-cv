// app/world/panels.ts
export type Panel = {
  id: string;
  title: string;
  bullets: string[];
  chips?: string[];
  ctas?: { label: string; href: string; external?: boolean }[];
  /** Optional image shown on the right side of the panel */
  imgUrl?: string;
  imgAlt?: string;
};

export const PANELS: Panel[] = [
  {
    id: "foyer",
    title: "Hi, I’m Ivana!",
    bullets: [
      "A Mechatronics Engineer building intelligent software who loves turning complex problems into elegant, functional solutions.",
      "Make yourself at home, explore the rooms, and keep an eye out for my two fluffy sidekicks. 🐾"
    ],
    ctas: [{ label: "Classic CV", href: "/cv" }],
    imgUrl: "/ivana.png",
    imgAlt: "Ivana smiling"
  },

  // ===== THE LAB: CURRENTLY WORKING ON =====
  {
    id: "lab",
    title: "This is my Creative Lab",
    bullets: [
    "This is where I share work-in-progress experiments and what I’m currently building.",
    "Right now I’m developing Bukshelf: an aesthetic, calm reading tracker that feels like your own library.",
    "Built with Android Studio using Java + Kotlin; as personalizable as it gets and thoughtfully minimal.",  
    "It’s still in the works (I’m giving it my all!) and I’m aiming for a first public release by the end of 2026. Here’s a little taste of what’s to come 👇"
    ],
    ctas: [{ label: "Homepage Mockup", href: "/home.png", external: true}],
  },

  // ===== THE WORKSHOP: WORK EXPERIENCE
  {
    id: "workshop-techauto-thesis",
    title: "Working Student (Thesis)",
    bullets: [
      "Engineered a custom Discrete Event Simulation (DES) engine from scratch to model autonomous robotic fleets in warehouse environments.", 
      "Implemented explicit state control loops (Idle → Working → Charging) to model physics-based battery degradation and thermal stress.",
      "Built an analytics pipeline using Matplotlib/Pandas to perform A/B testing between 'Baseline' vs. 'AI-Inspired' task allocation policies.",
      "Outcome: Demonstrated that predictive health monitoring reduces fleet failure rates significantly compared to reactive baselines."
    ],
    chips: ["Python", "Pandas", "NetworkX", "Algorithm Design"],
    ctas: [{ label: "View Code on GitHub", href: "https://github.com/ivanans98/fleet-simulation-engine", external: true }]
  },
  
    {
    id: "workshop-techauto",
    title: "Tech-Auto Ltd (Intern, Jul–Sep 2025)",
    bullets: [
      "What I built: a modern B2C site to support an e-commerce pivot.",
      "How: lightweight WordPress theme, minimal plugins + a bit of custom code, optimized images, and caching/CDN for fast loads.",
      "Impact: Lighthouse score improved from 67 → 89; faster pages, lower bounce, easier updates for the team."
    ],
      chips: ["Web Development", "Performance Optimization"]
    },
  
  {
    id: "workshop-stabilus",
    title: "Stabilus",
    bullets: [
      "What I built: Power BI dashboards fed from SAP data; MATLAB for data prep/cleanup.",
      "Industry 4.0 impact: data pipelines measurement, C# converters, LabVIEW interfaces.",
      "Shipped multilingual reporting: migrated dashboards from German-only to English and Spanish as well."
    ],
    chips: ["Data Engineering", "MATLAB", "Power BI", "C#"]
  },

  // ===== THE STUDY (EDUCATION) =====
  {
    id: "study",
    title: "My Study Path 📚",
    bullets: [
      "Graduated with a B.Eng. in Mechatronics at Hochschule Koblenz 🎓",
      "Thesis Focus: “From Data to Decisions” — It focuses on how AI + telematics help robotic fleets make smarter choices (due Dec 29, 2025).",
      "If you're interested in web design, UML diagrams, and AI, take a look at my previous work 👇"
    ],
    ctas: [
      { label: "From Data to Decisions", href: "/papers/bachelorarbeit.pdf" },
      { label: "ChatGPT in Software Development", href: "/papers/studienarbeit.pdf" },
      { label: "Modernizing Tech-Auto’s Digital Presence", href: "/papers/praxisphase.pdf" }
    ]
  },

  // ===== THE LIBRARY (SKILLS) =====
  {
    id: "library",
    title: "Technical Skills",
    bullets: [
      "Core Languages: Java, Kotlin, Python, C/C#/C++.",
      "Data & Analytics: MATLAB, Power BI, Looker Studio, SAP, SQL.",
      "PM & Collab: Jira, Asana, Slack, Figma, Git/GitHub.",
      "Automation & Eng: LabVIEW, CODESYS, Siemens Step7."
    ]
  },

  // ===== COFFEE (PERSONAL) =====
  {
    id: "coffee",
    title: "Enjoy a coffee with me ☕",
    bullets: [
      "It’s not all work, work, work, work, work 🎵 — here are a few things about me:",
      "I absolutely love traveling. I was born in Mexico, lived in the U.S. for a couple of years, and am currently in Germany. Along the way, I’ve had the blessing of visiting many other countries, and now I’m on the lookout for the next place to call home.",
      "Cozy nights in with my two cats (plus a good movie or a good book) are my happy place 😸😸",
      "Favorite movie: Harry Potter ⚡ (I'm a Ravenclaw - you?)",
      "Forever comfort show: Gilmore Girls 🍂❄️☕ (Fall is my favorite season too)",
      "Music: honestly, a bit of everything — my Spotify jumps from pop to country to rock to reggaetón. Always all ears.",
      "I love good conversations and a great cup of coffee. So always happy to chat!"
    ],
    ctas: [
    { label: "Email Me", href: "mailto:inavarretesanteliz@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ivana-navarrete-santeliz", external: true }]
  },

  // ===== GARDEN (CREDITS) =====
  {
    id: "garden",
    title: "Thanks for visiting 🌿",
    bullets: [
      "Thanks for taking the time to explore my digital home — I hope you got to know me a little better (and spotted Cookie & Belle 🐾).",
      "How it works: Built with React, TypeScript, and the HTML5 Canvas API.",
      "Under the hood: Custom collision detection (AABB), sprite animation loops, and React hooks for game state management.",
      "Art: 16-bit pixel art scaled for that retro cozy feel."
    ],
    ctas: [{label: "View Portfolio Source", href: "https://github.com/ivanans98/interactive-cv", external: true}]
  }
];

// Logic to merge "workshop" entries into one view
export const getPanel = (id: string) => {
  if (id === 'workshop') {
    const subs = PANELS.filter(p => p.id.startsWith('workshop-'));
    if (subs.length) {
      return {
        id: 'workshop',
        title: 'Workshop — Projects & Experience',
        bullets: subs.flatMap(s => [
          `— ${s.title}`,
          ...s.bullets
        ]),
        chips: Array.from(new Set(subs.flatMap(s => s.chips ?? []))),
        ctas: subs.flatMap(s => s.ctas ?? [])
      };
    }
  }
  return PANELS.find(p => p.id === id);
};
