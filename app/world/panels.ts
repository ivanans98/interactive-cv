// app/world/panels.ts
export type Panel = {
  id: string;
  title: string;
  bullets: string[];
  chips?: string[];
  ctas?: { label: string; href: string; external?: boolean }[];
};

export const PANELS: Panel[] = [
  {
    id: "foyer",
    title: "Foyer — About",
    bullets: [
      "Hi, I’m Ivana — a Mechatronics Engineer building intelligent software. I merge mechanical systems thinking with clean code to create reliable, human-friendly tech.",
      "My passion is turning complex problems—from messy production data to abstract app ideas—into elegant, functional solutions."
    ],
    ctas: [{ label: "Classic CV", href: "/cv" }],
    chips: ["Cozy", "Pixel-cute"]
  },
  {
    id: "lab",
    title: "Lab — Bookshelf (Android App, ETA 2026)",
    bullets: [
      "A beautiful reading tracker that feels like your personal bookshelf.",
      "Built with Kotlin; offline-first with Room; thoughtful UX for bookworms.",
      "Currently polishing the final details for a public launch."
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
    id: "ai-den",
    title: "AI Den — My POV",
    bullets: [
      "AI is the future; prompt engineering is core literacy.",
      "I focus on safe, explainable, non-hallucinating workflows.",
      "The job: teach AI and design guardrails."
    ],
    chips: ["Prompting", "Safety", "UX of AI"]
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
      { label: "LinkedIn", href: "www.linkedin.com/in/ivana-navarrete-santeliz", external: true },
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
