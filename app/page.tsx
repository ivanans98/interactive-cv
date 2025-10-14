export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold mb-3">Welcome to my world</h1>
      <p className="text-gray-400 mb-8">
        Explore a cozy, Gather.town-style house to discover my projects, skills, and story.
      </p>

      <div className="flex gap-4">
        <a
          href="/world"
          className="px-5 py-3 rounded-xl border border-gray-700 hover:border-gray-500"
        >
          ▶ Start exploring
        </a>
        <a
          href="/cv"
          className="px-5 py-3 rounded-xl border border-gray-700 hover:border-gray-500"
        >
          Open classic CV
        </a>
      </div>

      <div className="mt-14 text-sm text-gray-500">
        Cozy vibe • pixel-cute • no analytics — just a show & tell.
      </div>
    </main>
  );
}
