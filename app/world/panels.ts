// app/world/panels.ts
export type Panel = {
  id: string;
  title: string;
  bullets: string[];
  chips?: string[];
  ctas?: { label: string; href: string; external?: boolean }[];
  /** Optional image shown on the right side of the panel */
  imageUrl?: string;
  imageAlt?: string;
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

    imageUrl: "/ivana.png",
    imageAlt: "Ivana smiling"
  },
  {
    id: "lab",
    title: "This is my Creative Lab",
    bullets: [
    "This is where I share work-in-progress experiments and what I’m currently building.",
    "Right now I’m developing Bukshelf — an aesthetic, calm reading tracker that feels like your own library.",
    "Built with Android Studio using Java + Kotlin; as personalizable as it gets and thoughtfully minimal.",
    "It’s still in the works (I’m giving it my all!) and I’m aiming for a first public release by the end of 2026. I’ll keep the mockups updated as I go."
    ],
    ctas: [{ label: "Mockups", href: "#" }],
    chips: ["Android", "Kotlin", "Room"]
  },
  {
    id: "workshop-techauto",
    title: "Tech-Auto Ltd (Intern, Jul–Sep 2025)",
    bullets: [
      "Executed a full-stack redesign to support B2C expansion.",
      "WordPress build with custom code + e-commerce integration.",
      "Impact: Lighthouse 67 → 89 by optimizing assets and minimizing plugins."
    ],
    ctas: [
      { label: "Before/After", href: "#" },
      { label: "Live website", href: "https://example.com", external: true }
    ],
    chips: ["WordPress", "Java", "E-commerce"]
  },
  {
    id: "workshop-techauto-thesis",
    title: "Working Student (Thesis)",
    bullets: [
      "Authoring bachelor’s thesis “From Data to Decisions”.",
      "How AI + telematics optimize robotic fleets for smart-city logistics.",
      "Focus on route planning and reliability."
    ],
    chips: ["AI", "Telematics", "Fleets"]
  },
  {
    id: "workshop-stabilus",
    title: "Stabilus",
    bullets: [
      "Power BI dashboards from SAP data; MATLAB data prep.",
      "Digitalization 4.0: measurement data; C# converters; LabVIEW interfaces.",
      "UI improvements and maintainable analytics pipelines."
    ],
    chips: ["Power BI", "MATLAB", "C#", "LabVIEW", "SAP"]
  },
  {
    id: "study",
    title: "Study Corner — Education",
    bullets: [
      "B.Eng. Mechatronics — Hochschule Koblenz.",
      "Praxisphase (Industry Placement) and Studienarbeit (Research Paper) available as PDFs.",
      "Thesis deadline: Dec 29, 2025 — graduating right after."
    ],
    ctas: [
      { label: "Praxisphase PDF", href: "/papers/praxisphase.pdf" },
      { label: "Studienarbeit PDF", href: "/papers/studienarbeit.pdf" }
    ]
  },
  {
    id: "library",
    title: "Library — Skills",
    bullets: [
      "Languages & Dev: Java, Kotlin, Python, C/C#, C/C++, Spring Boot, Android Studio.",
      "Data & BI: MATLAB, Power BI, Looker Studio, SAP.",
      "PM & Collab: Jira, Asana, Slack, Figma, Git/GitHub.",
      "Automation & Eng: LabVIEW, CODESYS, Siemens Step7."
    ]
  },
  {
    id: "coffee",
    title: "Coffee — A human corner ☕",
    bullets: [
      "Currently reading & watching (updated occasionally).",
      "Favorite books, shows, films, music.",
      "Hobbies I enjoy outside work."
    ],
    ctas: [{ label: "Open Coffee page", href: "/coffee" }]
  },
  {
    id: "garden",
    title: "Garden — Contact",
    bullets: [
      "Let’s talk — happy to chat in English, German, or Spanish.",
      "Email + LinkedIn + GitHub below. CV available anytime."
    ],
    ctas: [
      { label: "Email", href: "mailto:inavarretesanteliz@gmail.com" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/ivana-navarrete-santeliz", external: true },
      { label: "GitHub", href: "https://github.com/ivanas98", external: true },
      { label: "Classic CV", href: "/cv" }
    ],
    chips: ["EN", "DE", "ES"]
  }
];

// Build a single “workshop” view by merging all workshop-* entries.
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
