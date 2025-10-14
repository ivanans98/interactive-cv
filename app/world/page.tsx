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
    title: "Foyer — About Ivana",
    bullets: [
      "Mechatronics + software; systems thinking and clean code.",
      "I like turning messy data into decisions and building human-friendly tools.",
      "2-min tour or free-explore — your pick."
    ],
    ctas: [
      { label: "Open classic CV", href: "/cv" },
    ],
    chips: ["Cozy", "Pixel-cute"]
  },
  {
    id: "lab",
    title: "Lab — Shelf (Android, in progress)",
    bullets: [
      "A beautiful reading tracker that feels like a bookshelf.",
      "Offline-first, Room DB; thoughtful UX for bookworms.",
      "Public launch target: 2026."
    ],
    ctas: [
      { label: "Teaser (soon)", href: "#", external: false },
      { label: "GitHub (placeholder)", href: "https://github.com", external: true }
    ],
    chips: ["Android", "Kotlin/Java", "Room"]
  },
  {
    id: "workshop-techauto",
    title: "Workshop — Tech-Auto Ltd (Praxisphase, Jun–Sep 2025)",
    bullets: [
      "Modernized and rebuilt the corporate site with e-commerce.",
      "WordPress + Java integrations; improved IA and performance.",
      "Delivered handover docs and admin training."
    ],
    chips: ["WordPress", "Java", "E-commerce"]
  },
  {
    id: "workshop-stabilus",
    title: "Workshop — Stabilus (Working Student & Intern)",
    bullets: [
      "Power BI dashboards from SAP data; MATLAB data prep.",
      "Industry 4.0 data; C# converters; LabVIEW interfaces.",
      "UI improvements and evaluation workflows."
    ],
    chips: ["Power BI", "MATLAB", "C#", "LabVIEW", "SAP"]
  },
  {
    id: "study",
    title: "Study Corner — Education & Thesis",
    bullets: [
      "B.Eng. Mechatronics — Hochschule Koblenz.",
      "Current thesis: From Data to Decisions: Optimizing Robotic Fleets with Telematics & AI.",
      "Deadline: Dec 29, 2025 — graduating right after."
    ],
    chips: ["Telematics", "AI", "Robotics"]
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
    title: "Library — Skills (Alphabetical)",
    bullets: [
      "Android • BI (Power BI / Looker Studio) • BORIS/LISA • C/C++",
      "Codesys / Siemens Step7 • Java • MATLAB • Python",
      "Each shelf links to a small example or note (coming soon)."
    ],
    chips: ["Android", "BI", "C/C++", "Python", "PLC"]
  },
  {
    id: "garden",
    title: "Garden — Contact",
    bullets: [
      "Let’s talk — happy to chat in English, German, or Spanish.",
      "Email + LinkedIn + GitHub below.",
      "CV available anytime."
    ],
    ctas: [
      { label: "Email", href: "mailto:inavarretesanteliz@gmail.com" },
      { label: "LinkedIn", href: "www.linkedin.com/in/ivana-navarrete-santeliz", external: true },
      { label: "GitHub", href: "https://github.com/ivanas98", external: true },
      { label: "Open CV", href: "/cv" }
    ],
    chips: ["EN", "DE", "ES"]
  }
];

function PanelCard({ p }: { p: Panel }) {
  return (
    <li className="border border-gray-700 rounded-2xl p-4">
      <div className="text-xs text-gray-500 mb-1">#{p.id}</div>
      <h2 className="text-xl font-medium mb-2">{p.title}</h2>
      <ul className="list-disc pl-5 space-y-1 text-gray-300">
        {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      {p.chips && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.chips.map((c) => (
            <span key={c} className="text-xs px-2 py-1 rounded-full border border-gray-700">{c}</span>
          ))}
        </div>
      )}
      {p.ctas && (
        <div className="mt-4 flex flex-wrap gap-3">
          {p.ctas.map((c) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="px-3 py-2 rounded-xl border border-gray-700 hover:border-gray-500 text-sm"
            >
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
      <p className="text-gray-400 mb-6">
        Gather.town vibes — click a room to open its panel. (Pixel map coming next.)
      </p>
      <ul className="grid sm:grid-cols-2 gap-4">
        {panels.map((p) => <PanelCard key={p.id} p={p} />)}
      </ul>
      <div className="mt-8">
        <a href="/" className="text-sm underline text-gray-400 hover:text-gray-200">← Back home</a>
      </div>
    </main>
  );
}
