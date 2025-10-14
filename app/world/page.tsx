type Panel = {
  id: string;
  title: string;
  bullets: string[];
  ctas?: { label: string; href: string; external?: boolean }[];
  chips?: string[];
};

const panels: Panel[] = [
  {
    id: "foyer",
    title: "Foyer — About",
    bullets: [
      "Hi, I’m Ivana! A Mechatronics Engineer building intelligent software. I merge mechanical systems thinking with clean code to create reliable, easy-to-use tech.",
      "My passion is turning complex problems—from messy production data to abstract app ideas—into elegant, functional solutions."
    ],
    ctas: [
      { label: "Quick Tour", href: "/world?tour=1" },
      { label: "Classic CV", href: "/cv" }
    ],
    chips: ["Cozy", "Pixel-cute"]
  },
  {
    id: "lab",
    title: "Lab — Bookshelf (Android App, ETA 2026)",
    bullets: [
      "A beautiful reading tracker that feels like your personal bookshelf.",
      "Built with Kotlin, thoughtful UX for bookworms.",
      "Currently polishing the final details for a public launch."
    ],
    ctas: [
      { label: "Mockups", href: "#", external: false }
    ],
    chips: ["Android", "Kotlin", "Room"]
  },
  {
    id: "workshop-techauto",
    title: "Workshop — Tech-Auto Ltd (Intern, Jul–Sep 2025)",
    bullets: [
      "Executed a full-stack redesign of the corporate website to support B2C expansion.",
      "WordPress build with custom code solutions and e-commerce integration.",
      "Key Impact: boosted Lighthouse score from 67 → 89 by optimizing assets and minimizing plugin dependencies."
    ],
    ctas: [
      { label: "Before/After Screens", href: "#"},
      { label: "Live Website", href: "https://example.com", external: true }
    ],
    chips: ["WordPress", "Java", "E-commerce"]
  },
  {
    id: "workshop-techauto-thesis",
    title: "Workshop — Tech-Auto Ltd (Working Student, Thesis)",
    bullets: [
      "Currently authoring my bachelor’s thesis, “From Data to Decisions”.",
      "Research: how AI + telematics optimize robotic fleets for smart-city logistics.",
      "Focus on route planning and system reliability."
    ],
    chips: ["AI", "Telematics", "Fleets"]
  },
  {
    id: "workshop-stabilus",
    title: "Workshop — Stabilus (Working Student & Intern)",
    bullets: [
      "Power BI dashboards from SAP data; MATLAB data prep and evaluation flows.",
      "Digitalization 4.0: measurement data from global machinery; C# converters; LabVIEW interfaces.",
      "UI improvements and a more maintainable analytics pipeline."
    ],
    chips: ["Power BI", "MATLAB", "C#", "LabVIEW", "SAP"]
  },
  {
    id: "study",
    title: "Study Corner — Education",
    bullets: [
      "B.Eng. Mechatronics — Hochschule Koblenz.",
      "Studienarbeit (Research Paper) and Praxisphase (Industry Placement) available as PDFs.",
      "Current thesis deadline: Dec 29, 2025 — graduating right after."
    ],
    ctas: [
      { label: "Praxisphase PDF", href: "/papers/praxisphase.pdf" },
      { label: "Studienarbeit PDF", href: "/papers/studienarbeit.pdf" }
    ],
    chips: ["Mechatronics"]
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
      "Languages & Development — What I use it for: building robust back-end services and Android apps. Fav tools: Java, Kotlin, Python, C/C++, C#, Spring Boot, Android Studio.",
      "Data & BI — Turning raw data into insights. Fav tools: MATLAB, Microsoft Power BI, Looker Studio, SAP.",
      "Project Management & Collaboration — Keeping agile work on track. Fav tools: Jira, Asana, Slack, Figma, Git/GitHub.",
      "Automation & Engineering — Interfacing with industrial hardware and controls. Fav tools: LabVIEW, CODESYS, Siemens Step7."
    ]
  },
  {
    id: "coffee",
    title: "Coffee — A human corner ☕",
    bullets: [
      "Currently reading & watching (updated occasionally).",
      "Favorite books, shows, films, and music.",
      "Hobbies I enjoy outside work."
    ],
    ctas: [
      { label: "Open Coffee page", href: "/coffee" }
    ]
  },
  {
    id: "garden",
    title: "Garden — Contact",
    bullets: [
      "Let’s talk — happy to chat in English, German, or Spanish.",
      "Email + LinkedIn + GitHub below. CV available anytime."
    ],
    ctas: [
      { label: "Email", href: "mailto:YOUR_EMAIL_HERE" },
      { label: "LinkedIn", href: "YOUR_LINKEDIN_URL", external: true },
      { label: "GitHub", href: "https://github.com/ivanas98", external: true },
      { label: "Classic CV", href: "/cv" }
    ],
    chips: ["EN", "DE", "ES"]
  }
];

function PanelCard({ p }: { p: Panel }) {
  return (
    <li className="rounded-2xl p-4"
        style={{background:"var(--panel)", border:"1px solid var(--border)"}}>
      <div className="text-xs" style={{color:"var(--muted)"}}>#{p.id}</div>
      <h2 className="text-xl font-medium mb-2">{p.title}</h2>
      <ul className="list-disc pl-5 space-y-1" style={{color:"var(--fg)"}}>
        {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      {p.chips && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.chips.map((c) => (
            <span key={c}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{border:"1px solid var(--border)", color:"var(--muted)"}}>
              {c}
            </span>
          ))}
        </div>
      )}
      {p.ctas && (
        <div className="mt-4 flex flex-wrap gap-3">
          {p.ctas.map((c) => (
            <a key={c.label} href={c.href}
               {...(c.external ? { target:"_blank", rel:"noreferrer" } : {})}
               className="px-3 py-2 rounded-xl text-sm"
               style={{border:"1px solid var(--border)"}}>
              {c.label}
            </a>
          ))}
        </div>
      )}
    </li>
  );
}

export default function World() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-3xl font-semibold mb-2">The Cozy House</h1>
      <p className="mb-6" style={{color:"var(--muted)"}}>
        Click a room to open its panel. (Pixel map coming next.)
      </p>
      <ul className="grid sm:grid-cols-2 gap-4">
        {panels.map((p) => <PanelCard key={p.id} p={p} />)}
      </ul>
      <div className="mt-8">
        <a href="/" className="underline" style={{color:"var(--muted)"}}>← Back home</a>
      </div>
    </main>
  );
}
